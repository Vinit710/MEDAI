

# Medical Chatbot and Disease Prediction System

This project is a web-based application that offers a chatbot for medical conversations and image-based disease prediction, such as ocular and skin disease predictions. The backend is built using Express.js and integrates with Gradio-hosted machine learning models to provide medical insights.

## Features

1. **Chatbot**: A medical chatbot that answers user questions. Each session is treated independently, and the system can store past sessions for later review.
2. **Ocular Disease Prediction**: Upload images of left and right eyes to receive a disease prediction.
3. **Skin Disease Prediction**: Upload an image of a skin area to get a prediction on possible skin conditions.
4. **Session Management**: Each time the chatbot is refreshed, a new session is started. Previous sessions are stored for future reference.

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Machine Learning**: Gradio-hosted models via Gradio's API
- **File Upload**: Multer for handling image uploads

## Installation and Setup

### Prerequisites

- Node.js (v14+)
- NPM (comes with Node.js)

### Clone the Repository

```bash
git clone https://github.com/Vinit710/MEDAI
cd MEDAI

### Install Dependencies

```bash
npm install
```

### Start the Server

```bash
node server.mjs
```

By default, the server will start on `http://localhost:3000`.

## Project Structure
```
.
├── chatbot/
│   ├── __init__.py              # Package initializer for chatbot module
│   ├── ocular_diabetes_prediction # Module for ocular disease prediction logic         
├── uploads/                     # Directory for uploaded images
├── templates/                   # Static HTML templates for frontend
│   ├── index.html               # Home page
│   ├── about.html               # About page
│   ├── chatbot.html             # Chatbot page
│   ├── ocular.html              # Ocular disease prediction page
│   ├── skin_disease.html        # Skin disease prediction page
│   ├── booking.html             # Appointment booking page
│   ├── chat.html                # Chat interface page
│   ├── symtodie.html            # Symptom-to-disease mapping page
│   ├── contact.html             # Contact page
│   └── docs.html                # Documentation page
├── static/                      # Directory for static files (CSS, JS)
├── script.mjs                   # Main JavaScript module for frontend interactions
├── script_skin.mjs              # JavaScript module for skin disease-related interactions
├── server.mjs                   # Server-side logic (Node.js backend)
├── package.json                 # Project configuration and dependencies
├── package-lock.json            # Lockfile for exact dependency versions
├── requirements.txt             # Python package dependencies
├── README.md                    # Project documentation
```
## API Endpoints

### 1. Chatbot
- **POST** `/chatbot`
- **Request Body**: `{ "message": "User's message" }`
- **Response**: `{ "reply": "Bot's response" }`

### 2. Ocular Disease Prediction
- **POST** `/predict`
- **File Uploads**: `left_image`, `right_image`
- **Response**: JSON with prediction data

### 3. Skin Disease Prediction
- **POST** `/predict_skin`
- **File Upload**: `input_image`
- **Response**: JSON with prediction data

## Deployment

You can deploy this project to any Node.js hosting platform such as Heroku, DigitalOcean, or Vercel.

### Deploy to Heroku

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Run the following commands:

```bash
heroku login
heroku create
git push heroku main
```

3. Your application will be available at the Heroku-generated URL.

## Future Improvements

- Add authentication for storing and retrieving users' chat history securely.
- Improve the chatbot by integrating more advanced natural language processing (NLP) models.
- Expand the disease prediction models to cover more medical conditions.

## License

This project is licensed under the MIT License.
```

### Usage Instructions
Make sure to replace the placeholder `Gradio` model paths in the code with actual model paths from Gradio once they're available. You can further customize the design in the `templates` directory to fit your style preferences.
