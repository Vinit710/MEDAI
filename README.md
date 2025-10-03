

## Hacktober Contributions Accepted
### Read the Contribution documentaion before starting.

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
```

### Install Dependencies

```bash
npm install
```

### Start the Server

```bash
node server.mjs
```

By default, the server will start on `http://localhost:3000`.


## Environment variables (.env)

Create a `.env` file in the project root with the following line (do NOT commit this file):

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

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
|   |-- xray.html                # x ray model page
│   ├── contact.html             # Contact page
│   └── docs.html                # Documentation page
├── static/                      # Directory for static files (CSS, JS)
├── server.mjs                   # Server-side logic (Node.js backend and API's)
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

Initially it is deployed on vercel you can try it there: https://medai-phi.vercel.app/

## Screenshots

Here are some screenshots of the application:

1. **Chatbot Interface**  
   ![Chatbot Interface](https://drive.google.com/uc?id=1OCZkNqKwDkdNl-CaBOO_7sZ_8cMr69ks)

2. **Ocular Disease Prediction Page**  
   ![Ocular Disease Prediction](https://drive.google.com/uc?id=1GROBxU-LvlVnXsbJknvTqneQoK2TY2V_)

3. **Home Page**  
   ![Home_1](https://drive.google.com/uc?id=1Umm7fA0jQlYrgCfwFps9ggW5-NwdmdsQ)

4. **Home page**  
   ![Home_2](https://drive.google.com/uc?id=1c-fN0kizbbkMWOUgtGDQ76nt36UPVgVP)




## Future Improvements

- Add authentication for storing and retrieving users' chat history securely.
- Improve the chatbot by integrating more advanced natural language processing (NLP) models.
- Expand the disease prediction models to cover more medical conditions.
- Make better UI
- Any other features will be appriated.

## License

This project is licensed under the MIT License.





## Contributing (Hacktober Friendly)

Thanks for opening this repository for Hacktober! We welcome contributions of all sizes — bug fixes, new features, tests, documentation, and CI/CD improvements. Below are guidelines to help you get started.

1. Fork the repository and create a branch for your change. Use meaningful branch names, e.g. `feature/add-xray-model` or `fix/predict-endpoint-bug`.
2. Keep PRs small and focused: one feature, one bugfix, or one set of tests per PR.
3. Add tests for any behavior you change or add. We prefer lightweight tests that run quickly.
4. Write a clear PR description explaining the problem, the change, and how to test it locally.
5. Be responsive to review comments; maintainers may ask for small changes before merging.

Labeling and Hacktober rules
- Include `hacktoberfest-accepted` as a label if your PR meets the contribution criteria for the event (maintainers will add this after review).

What to contribute
- New features: small, well-scoped features (e.g. a new model endpoint, CLI helper, or small UI improvement).
- Tests: unit tests for server endpoints or utilities. Prefer Node test runners such as Jest or AVA.
- CI/CD: Add GitHub Actions workflows for linting, tests, and automated deployment (example below).
- Docs: Improve README, add setup guides, or fix typos.


CI/CD (suggested GitHub Actions)
- Add workflows in `.github/workflows/` to run tests on push/PR and optionally deploy on push to `main`.
- Example jobs to include:
   - install-deps (npm ci)
   - lint (eslint)
   - test (npm test)
   - build & deploy (optional — e.g., to Vercel or Azure Static Web Apps)

Example minimal GitHub Actions workflow (place in `.github/workflows/ci.yml`):

```yaml
name: CI

on: [push, pull_request]

jobs:
   test:
      runs-on: ubuntu-latest
      steps:
         - uses: actions/checkout@v4
         - name: Use Node.js
            uses: actions/setup-node@v4
            with:
               node-version: '18'
         - name: Install dependencies
            run: npm ci
         - name: Run tests
            run: npm test

```



Thank you for contributing!