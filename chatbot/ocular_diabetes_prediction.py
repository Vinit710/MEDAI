import pickle
import numpy as np

# Load your trained model (replace 'disease_model.pkl' with your actual model path)
with open('models/disease_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Define the symptoms list (modify this based on your dataset)
SYMPTOMS = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 
    'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity', 'bladder_discomfort'
]

def predict_disease(symptoms):
    # Create input vector
    input_vector = np.zeros(len(SYMPTOMS))
    
    for symptom in symptoms:
        if symptom in SYMPTOMS:
            index = SYMPTOMS.index(symptom)
            input_vector[index] = 1
    
    # Reshape the input vector and make a prediction
    input_vector = input_vector.reshape(1, -1)
    prediction = model.predict(input_vector)[0]
    return prediction
