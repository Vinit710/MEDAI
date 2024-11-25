import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client } from '@gradio/client';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Validate Gradio space accessibility
async function validateGradioSpace(spaceName) {
  try {
    const spaceUrl = `https://huggingface.co/spaces/${spaceName}`;
    const client = await Client.connect(spaceName, {
      hf_token: process.env.HF_TOKEN, // Optional: Add your Hugging Face token if you have one
      max_retries: 3,
      timeout: 30000,
      verbose: true
    });
    console.log(`Successfully connected to ${spaceName}`);
    return client;
  } catch (error) {
    console.error(`Failed to connect to ${spaceName}:`, error.message);
    return null;
  }
}

// Initialize clients with validation
async function initializeClients() {
  const spaces = {
    medical: 'Vinit710/GMED',
    skin: 'Vinit710/Skin_Disease',
    chat: 'Vinit710/Chatbot',
    symtodie: 'Vinit710/symtodise',
    xray: 'darksoule26/fracture'
  };

  const clients = {};
  
  for (const [key, space] of Object.entries(spaces)) {
    console.log(`Attempting to connect to ${space}...`);
    const client = await validateGradioSpace(space);
    if (client) {
      clients[key] = client;
      console.log(`✓ ${key} client initialized`);
    } else {
      console.error(`✗ Failed to initialize ${key} client`);
    }
  }

  return clients;
}

// Start server with proper error handling
async function startServer() {
  console.log('Initializing server...');
  
  let clients;
  try {
    clients = await initializeClients();
    if (Object.keys(clients).length === 0) {
      throw new Error('No Gradio clients could be initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Gradio clients:', error);
    process.exit(1);
  }

  const app = express();
  const port = process.env.PORT || 3000;

  // Basic middleware setup
  app.use(bodyParser.json());
  app.use(express.static('public'));
  app.use('/static', express.static(path.join(__dirname, 'static')));

  // Multer setup
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  const upload = multer({ storage });

  // Route handlers
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    const status = Object.entries(clients).reduce((acc, [key, client]) => {
      acc[key] = client ? 'connected' : 'disconnected';
      return acc;
    }, {});
    res.json({ status });
  });

  // Example prediction endpoint with proper error handling
  app.post('/predict', upload.fields([{ name: 'left_image' }, { name: 'right_image' }]), async (req, res) => {
    if (!clients.medical) {
      return res.status(503).json({ error: 'Medical prediction service unavailable' });
    }

    try {
      const leftImagePath = req.files['left_image'][0].path;
      const rightImagePath = req.files['right_image'][0].path;

      const leftEyeBuffer = fs.readFileSync(leftImagePath);
      const rightEyeBuffer = fs.readFileSync(rightImagePath);

      const result = await clients.medical.predict("/predict", {
        left_image: new Blob([leftEyeBuffer]),
        right_image: new Blob([rightEyeBuffer]),
      });

      res.json(result);
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ 
        error: 'Prediction failed',
        details: error.message
      });
    } finally {
      // Cleanup uploaded files
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('\nGradio clients status:');
    Object.entries(clients).forEach(([key, client]) => {
      console.log(`${client ? '✓' : '✗'} ${key}: ${client ? 'Connected' : 'Failed'}`);
    });
  });
}

// Run the server with global error handling
startServer().catch(error => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});