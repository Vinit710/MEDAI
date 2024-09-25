import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client } from '@gradio/client';
import bodyParser from 'body-parser';

import nodemailer from 'nodemailer';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp directory for uploads (required for Vercel's read-only filesystem)
const upload = multer({ dest: '/tmp/' });

// Initialize Gradio clients
const client = await Client.connect("Vinit710/GMED");  // Replace with your actual Gradio app
const skinClient = await Client.connect("Vinit710/Skin_Disease");
const chatClient = await Client.connect("Vinit710/Chatbot");
const symtodieClient = await Client.connect('Vinit710/symtodise');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

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
    // Clean up the uploaded image file from /tmp
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);  // Ensure the file is deleted even in case of errors
    }
  }
});
app.post('/chatbot', async (req, res) => {
  const userMessage = req.body.message;

  try {
      // Call the API to get the chatbot's response
      const result = await chatClient.predict('/chat', {
          message: userMessage,
          system_message: "You are a friendly chatbot.",  // Custom system message
          max_tokens: 512,  // Define the max tokens for the response
          temperature: 0.7,  // Control the randomness of the response
          top_p: 0.95        // Control diversity via nucleus sampling
      });

      // Return the chatbot response to the front-end
      res.json({ reply: result.data });
  } catch (error) {
      console.error('Error communicating with the API:', error);
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
