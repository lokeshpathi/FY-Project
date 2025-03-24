import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/Authcontext"; // Import AuthContext

const predefinedSymptoms = [
  "itching",
  "skin_rash",
  "nodal_skin_eruptions",
  "continuous_sneezing",
  "shivering",
  "chills",
  "joint_pain",
  "stomach_pain",
  "acidity",
  "ulcers_on_tongue",
  "muscle_wasting",
  "vomiting",
  "burning_micturition",
  "spotting_urination",
  "fatigue",
  "weight_gain",
  "anxiety",
  "cold_hands_and_feets",
  "mood_swings",
  "weight_loss",
  "restlessness",
  "lethargy",
  "patches_in_throat",
  "irregular_sugar_level",
  "cough",
  "high_fever",
  "sunken_eyes",
  "breathlessness",
  "sweating",
  "dehydration",
  "indigestion",
  "headache",
  "yellowish_skin",
  "dark_urine",
  "nausea",
  "loss_of_appetite",
  "pain_behind_the_eyes",
  "back_pain",
  "constipation",
  "abdominal_pain",
  "diarrhoea",
  "mild_fever",
  "yellow_urine",
  "yellowing_of_eyes",
  "acute_liver_failure",
  "fluid_overload",
  "swelling_of_stomach",
  "swelled_lymph_nodes",
  "malaise",
  "blurred_and_distorted_vision"
];

const SymptomSelector = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get user from context
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // Add Symptom
  const addSymptom = () => {
    if (newSymptom && !selectedSymptoms.includes(newSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, newSymptom]);
      setNewSymptom("");
    }
  };

  // Remove Symptom
  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  const searchDoctors = async () => {
    if (selectedSymptoms.length === 0) return alert("Please add at least one symptom.");
    if (!location) return alert("Please select a location.");
  
    console.log("Sending Symptoms to Backend:", selectedSymptoms);
    console.log("Sending Location to Backend:", location);
  
    try {
      const response = await axios.post("http://localhost:5001/api/search", {
        symptoms: selectedSymptoms,
        location,
      });
  
      console.log("✅ Backend Response:", response.data); // Check what the backend sends
  
      navigate("/find-doctors", {
        state: {
          doctors: response.data.doctors || [],
          disease: response.data.predicted_disease || "Unknown",
          confidence:response.data.confidence,
          specializations: response.data.doctor_specializations || [],
        },
      });
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      alert("Failed to retrieve doctors.");
    }
  };
  

  return (
    <div className="w-full max-w-md mx-auto mt-6 p-6 bg-white shadow-md rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-4">Select Your Symptoms</h3>

      {/* Symptom Dropdown */}
      <div className="flex gap-2">
        <select
          value={newSymptom}
          onChange={(e) => setNewSymptom(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a symptom --</option>
          {predefinedSymptoms.map((symptom) => (
            <option key={symptom} value={symptom}>{symptom}</option>
          ))}
        </select>
        <button 
          onClick={addSymptom} 
          className="py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition">
          Add
        </button>
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {selectedSymptoms.map((symptom) => (
            <div key={symptom} className="flex items-center bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              <span className="mr-2">{symptom}</span>
              <button onClick={() => removeSymptom(symptom)} className="text-red-500 hover:text-red-700 transition">✖</button>
            </div>
          ))}
        </div>
      )}

      {/* Location Selector */}
      <div className="flex flex-col items-center gap-4 mt-4 w-full">
        <select 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
          <option value="">Select Location...</option>
          <option value="Eluru">Eluru</option>
          <option value="Vijayawada">Vijayawada</option>
          <option value="Vizag">Vizag</option>
          <option value="Bhimavaram">Bhimavaram</option>
          <option value="Nellore">Nellore</option>
          <option value="Kakinada">Kakinada</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>
      </div>

      {/* Search Button */}
      <button 
        onClick={searchDoctors} 
        className="w-full mt-4 py-2 px-4 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition">
        {loading ? "Searching..." : "Find Doctors"}
      </button>
    </div>
  );
};

export default SymptomSelector;
