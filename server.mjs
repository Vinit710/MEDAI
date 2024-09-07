import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client } from '@gradio/client';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it does not exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Initialize the Gradio client
const client = await Client.connect("Vinit710/GMED");  // Replace with your actual Gradio app
const skinClient = await Client.connect("Vinit710/Skin_Disease"); 

const app = express();
const port = 3000;

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

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'contact.html'));
});

app.get('/ocular', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'ocular.html'));
});

app.get('/skin_disease', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'skin_disease.html'));
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


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
