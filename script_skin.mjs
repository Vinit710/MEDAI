import { Client } from "@gradio/client";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract input file path from the command-line arguments
const [imagePath] = process.argv.slice(2);

async function uploadImage() {
  try {
    // Read the input image as a buffer
    const imageBuffer = readFileSync(imagePath);

    // Connect to the Gradio app for skin disease detection
    console.log('Connecting to Gradio skin disease app...');
    const app = await Client.connect("your_username/skin_disease_model");  // Replace with your actual Gradio app URL

    // Send the image for prediction
    console.log('Making prediction...');
    const result = await app.predict("/predict", {
      input_image: new Blob([imageBuffer]),  // Wrap buffer in Blob
    });

    // Log the prediction result
    console.log('Prediction result:', result);

    // Extract the label from the result data
    if (result && result.data && result.data[0] && result.data[0].label) {
      console.log(`Predicted skin disease: ${result.data[0].label}`);
    } else {
      console.error('No valid prediction label received.');
    }

  } catch (error) {
    // Catch and log any errors that occur during the process
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);
  }
}

// Execute the uploadImage function
uploadImage();
