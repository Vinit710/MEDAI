import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Client } from '@gradio/client';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env (if present)
dotenv.config();

// Normalize GEMINI_API_KEY (strip surrounding quotes if user added them)
const rawGeminiKey = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY = rawGeminiKey ? rawGeminiKey.replace(/^\s*"?(.*?)"?\s*$/, '$1') : undefined;
if (GEMINI_API_KEY) {
  // Mask the key when logging (show first/last 4 chars only)
  const masked = GEMINI_API_KEY.length > 8 ? `${GEMINI_API_KEY.slice(0,4)}...${GEMINI_API_KEY.slice(-4)}` : '***';
  console.log(`GEMINI_API_KEY loaded from environment (masked): ${masked}`);
} else {
  console.warn('GEMINI_API_KEY not found in environment. The Gemini client may attempt to use application default credentials.');
}

// Create uploads directory if it does not exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Initialize the Gradio client
let client, skinClient, chatClient, symtodieClient;
try {
  client = await Client.connect("Vinit710/GMED");
} catch (e) {
  console.error("Could not connect to Vinit710/GMED:", e.message);
}
try {
  skinClient = await Client.connect("Vinit710/Skin_Disease");
} catch (e) {
  console.error("Could not connect to Vinit710/Skin_Disease:", e.message);
}
try {
  chatClient = await Client.connect("peteparker456/medical_diagnosis_llama2");
} catch (e) {
  console.error("Could not connect to peteparker456/medical_diagnosis_llama2:", e.message);
}
try {
  symtodieClient = await Client.connect('Vinit710/symtodise');
} catch (e) {
  console.error("Could not connect to Vinit710/symtodise:", e.message);
}

// Connect to the Hugging Face model via Gradio Client
// const xrayClient = await Client.connect("darksoule26/fracture");

const app = express();
const port = 3001;
app.use(bodyParser.json());
app.use(express.static('public'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);  // Save files to the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')))

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'about.html'));
});

app.get('/chatbot', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'chatbot.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'contact.html'));
});

app.get('/ocular', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'ocular.html'));
});

app.get('/skin_disease', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'skin_disease.html'));
});

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'docs.html'));
});

app.get('/symtodie', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'symtodie.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'booking.html'));
});

app.get('/xray', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'xray.html'));
});

// Handle image uploads and predictions for ocular
app.post('/predict', upload.fields([{ name: 'left_image' }, { name: 'right_image' }]), async (req, res) => {
  try {
    const leftImagePath = req.files['left_image'][0].path;
    const rightImagePath = req.files['right_image'][0].path;

    // Log paths to ensure they are correct
    console.log(`Left image path: ${leftImagePath}`);
    console.log(`Right image path: ${rightImagePath}`);

    // Read the input images as buffers
    const leftEyeBuffer = fs.readFileSync(leftImagePath);
    const rightEyeBuffer = fs.readFileSync(rightImagePath);

    // Send both left and right eye images for prediction
    console.log('Making prediction...');
    const result = await client.predict("/predict", {
      left_image: new Blob([leftEyeBuffer]),  // Wrap buffer in Blob
      right_image: new Blob([rightEyeBuffer]), // Wrap buffer in Blob
    });

    // Log the prediction result
    console.log('Prediction result:', result);

    // Extract the label from the result data
    if (result && result.data && result.data[0] && result.data[0].label) {
      console.log(`Predicted label: ${result.data[0].label}`);
      res.json(result);  // Return the result as a JSON response
    } else {
      console.error('No valid prediction label received.');
      res.status(500).json({ error: 'No valid prediction label received.' });
    }
    
    // Clean up uploaded files
    fs.unlinkSync(leftImagePath);
    fs.unlinkSync(rightImagePath);

  } catch (error) {
    // Catch and log any errors that occur during the process
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Handle skin disease image upload and prediction
app.post('/predict_skin', upload.single('input_image'), async (req, res) => {
  try {
    // Get the image path
    const imagePath = req.file.path;
    console.log(`Image path: ${imagePath}`);

    // Read the uploaded image as a buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Convert the buffer into a Blob object to send to the prediction API
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });  // Change MIME type if necessary

    console.log('Making prediction...');

    // Send the image for prediction using the skinClient
    const result = await skinClient.predict("/predict", {
      img: imageBlob  // Correctly send the image as 'img' parameter
    });

    // Log the prediction result
    console.log('Prediction result:', result);

    // Check if the result contains the expected label
    if (result && result.data && result.data[0]) {
      const predictedLabel = result.data[0];
      console.log(`Predicted label: ${predictedLabel}`);
      
      // Return the prediction result as JSON
      res.status(200).json({ data: [predictedLabel] });
    } else {
      console.error('No valid prediction label received.');
      res.status(500).json({ error: 'No valid prediction label received.' });
    }

  } catch (error) {
    // Log the error for debugging
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);

    // Return an error response
    res.status(500).json({ error: 'Prediction failed. ' + error.message });
  } finally {
    // Clean up the uploaded image file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);  // Ensure the file is deleted even in case of errors
    }
  }
});

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); // Uses GEMINI_API_KEY from environment or .env

app.post('/chatbot', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or "gemini-2.5-flash" if you want the latest
      contents: [{ role: "user", parts: [{ text: userMessage }] }]
    });

    // The SDK returns a response object; extract the text
    const reply = response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response.";
    res.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error.message, error.response?.data);
    res.status(500).json({ reply: "Sorry, something went wrong with the chatbot." });
  }
});

// Symptom to Disease Prediction API endpoint
app.post('/predict_symtodie', async (req, res) => {
  try {
      const {
          age, gender, fever, cough, fatigue,
          difficulty_breathing, blood_pressure, cholesterol_level
      } = req.body;

      // Make the prediction using the symptom-to-disease Gradio client
      const result = await symtodieClient.predict('/predict', {
          age: age,
          gender: gender,
          fever: fever,
          cough: cough,
          fatigue: fatigue,
          difficulty_breathing: difficulty_breathing,
          blood_pressure: blood_pressure,
          cholesterol_level: cholesterol_level
      });

      // Return the predicted result
      res.json({ prediction: result.data });

  } catch (error) {
      console.error('Error during symptom-to-disease prediction:', error.message);
      res.status(500).json({ error: 'Prediction failed.' });
  }
});

// // Handle X-ray image upload and prediction
// app.post('/predict_xray', upload.single('input_image'), async (req, res) => {
//   try {
//     const imagePath = req.file.path;
//     console.log(`Uploaded X-ray image path: ${imagePath}`);

//     // Read the image as a Blob
//     const imageBuffer = fs.readFileSync(imagePath);
//     const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });  // Set correct MIME type

//     // Make the prediction call to the Hugging Face API
//     const result = await xrayClient.predict("/predict", {
//       img: imageBlob  // Use the Blob format as required by the API
//     });

//     console.log('Prediction result:', result);

//     // Extract the prediction text from the API response
//     const prediction = result.data[0];

//     // Return the prediction result as JSON
//     res.status(200).json({ prediction });
//   } catch (error) {
//     console.error('Error during prediction:', error.message);
//     res.status(500).json({ error: 'Prediction failed. ' + error.message });
//   } finally {
//     // Clean up the uploaded image file
//     if (fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
//   }
// });


// Endpoint to handle email sending
app.post('/sendEmail', async (req, res) => {
  const { name, phone, email, hospital, date } = req.body;

  // Set up transporter for Nodemailer (using Gmail as an example)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
      user: 'med.ai.services.pvt@gmail.com', // replace with your email
      pass: 'lbynfuyroyherynf', // replace with your email password or app password
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'med.ai.services.pvt@gmail.com',
    to: email, // Send to the user's email
    subject: 'Appointment Confirmation',
    text: `Dear ${name},\n\nYour appointment has been booked at ${hospital}.\n\nDate and Time: ${date}\n\nThank you for using our service.\n\nPhone: ${phone}`,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
