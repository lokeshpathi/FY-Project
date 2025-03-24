from flask import Flask, request, jsonify
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

app = Flask(__name__)

# Load the dataset
data = pd.read_csv('data_set.csv')
data.fillna('No', inplace=True)

# Extract features and target
X = data.drop(columns=['prognosis', 'Unnamed: 133'], errors='ignore')
Y = data['prognosis']

# Encode target variable
label_encoder = LabelEncoder()
Y = label_encoder.fit_transform(Y)

# Encode feature values
X = X.map(lambda x: 1 if x == 'Yes' else 0)

# Get all symptom names
ALL_SYMPTOMS = X.columns.tolist()

# Split data into training and testing sets
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# Train a Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, Y_train)

# Evaluate the model
Y_pred = model.predict(X_test)
accuracy = accuracy_score(Y_test, Y_pred)
print(f"Model accuracy: {accuracy * 100:.2f}%")

# Load disease-specialization mapping
specialization_mapping = pd.read_csv('disease_specialization_mapping.csv')

@app.route('/predict', methods=['POST'])
def predict_disease():
    try:
        # Get request data
        symptom_dict = request.json or {}

        # Ensure all symptoms are present, setting missing ones to 'No'
        formatted_data = {symptom: symptom_dict.get(symptom, "No") for symptom in ALL_SYMPTOMS}

        # Convert "Yes"/"No" to 1/0
        input_data = pd.DataFrame([formatted_data])
        input_data = input_data.map(lambda x: 1 if x == 'Yes' else 0)

        # Predict disease
        predicted_probs = model.predict_proba(input_data)  # Get probability of each class
        predicted_disease_encoded = model.predict(input_data)[0]
        predicted_disease = label_encoder.inverse_transform([predicted_disease_encoded])[0]

        # Get confidence score (probability of the predicted class)
        confidence = predicted_probs[0][predicted_disease_encoded] * 100  # Convert to percentage

        # Get doctor specializations
        specializations = specialization_mapping[specialization_mapping['Disease'] == predicted_disease]
        specializations_list = specializations['Doctor Specialization'].tolist()
        return jsonify({
            "predicted_disease": predicted_disease,
            "doctor_specializations": specializations_list,
            "confidence": confidence  # Accuracy for this specific prediction
        })
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
