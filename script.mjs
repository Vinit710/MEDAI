import { Client } from "@gradio/client";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract input file paths from the command-line arguments
const [leftEyeImagePath, rightEyeImagePath] = process.argv.slice(2);

async function uploadImages() {
  try {
    // Read the input images as buffers
    const leftEyeBuffer = readFileSync(leftEyeImagePath);
    const rightEyeBuffer = readFileSync(rightEyeImagePath);

    // Connect to the Gradio app
    console.log('Connecting to Gradio app...');
    const app = await Client.connect("Vinit710/GMED");  // Replace with your actual Gradio app

    // Send both left and right eye images for prediction
    console.log('Making prediction...');
    const result = await app.predict("/predict", {
      left_image: new Blob([leftEyeBuffer]),  // Wrap buffer in Blob
      right_image: new Blob([rightEyeBuffer]), // Wrap buffer in Blob
    });

    // Log the prediction result
    console.log('Prediction result:', result);

    // Extract the label from the result data
    if (result && result.data && result.data[0] && result.data[0].label) {
      console.log(`Predicted label: ${result.data[0].label}`);
    } else {
      console.error('No valid prediction label received.');
    }

  } catch (error) {
    // Catch and log any errors that occur during the process
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);
  }
}

// Execute the uploadImages function
uploadImages();
