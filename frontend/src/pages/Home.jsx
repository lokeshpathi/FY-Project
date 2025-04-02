import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SymptomSelector from "../components/SymptomSelector";
import { AuthContext } from "../context/Authcontext"; // Import AuthContext
import "./Home.css";

const specializationsList = [
  "Dermatologist",
  "General Practitioner",
  "Gastroenterologist",
  "Hepatologist",
  "Allergist",
  "Infectious Disease Specialist",
  "Endocrinologist",
  "Pulmonologist",
  "Cardiologist",
  "Neurologist",
  "Orthopedist",
  "Rheumatologist",
  "Vascular Surgeon",
  "ENT Specialist",
  "Urologist",
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get user from context
  const [searchType, setSearchType] = useState("specialization");
  const [specialization, setSpecialization] = useState("");
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter suggestions based on user input
  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    setSpecialization(value);

    if (value.trim() === "") {
      setFilteredSpecializations([]);
    } else {
      const filtered = specializationsList.filter((spec) =>
        spec.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSpecializations(filtered);
    }
  };

  // Select specialization from suggestions
  const selectSpecialization = (spec) => {
    setSpecialization(spec);
    setFilteredSpecializations([]); // Hide suggestions
  };

  // Function to search doctors by specialization
  const searchDoctorsBySpecialization = async () => {
    if (!user) {
      navigate("/login"); // Redirect to login if not logged in
      return;
    }

    if (!specialization) return alert("Please enter a specialization.");
    if (!location) return alert("Please select a location.");

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/api/search-specialization",
        {
          specialization,
          location,
        }
      );

      navigate("/find-doctors", {
        state: { doctors: response.data.doctors, specialization },
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      alert("Failed to retrieve doctors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="home text-center px-6 py-10 flex flex-col items-center relative"
      style={{
        backgroundImage: "url('./img2.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="flex-col items-center justify-center relative z-10">
        <h2 className="text-3xl font-bold text-white">
          Get the Best Doctors at Your Fingertips
        </h2>
        <p className="text-white mt-2">Schedule Your Appointment Online</p>

        {/* Toggle Search Type */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className={`py-2 px-4 rounded-md font-semibold transition ${
              searchType === "specialization"
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setSearchType("specialization")}
          >
            Search by Specialization
          </button>
          <button
            className={`py-2 px-4 rounded-md font-semibold transition ${
              searchType === "symptoms"
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setSearchType("symptoms")}
          >
            Search by Symptoms
          </button>
        </div>

        {/* Conditionally Render Search UI */}
        {searchType === "specialization" ? (
          <div className="flex flex-col items-center justify-center gap-4 ml-[56px] mt-6 w-full max-w-md ">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Enter Specialization (e.g., Cardiologist)"
                value={specialization}
                onChange={handleSpecializationChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {/* Auto-suggestion Dropdown */}
              {filteredSpecializations.length > 0 && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10">
                  {filteredSpecializations.map((spec) => (
                    <li
                      key={spec}
                      className="p-2 cursor-pointer hover:bg-blue-100"
                      onClick={() => selectSpecialization(spec)}
                    >
                      {spec}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Location...</option>
              <option value="Eluru">Eluru</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Kakinada">Kakinada</option>
              <option value="Bhimavaram">Bhimavaram</option>
              <option value="Vizag">Vizag</option>
              <option value="Nellore">Nellore</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>

            <button
              onClick={searchDoctorsBySpecialization}
              className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-md">
            <SymptomSelector />
          </div>
        )}

        {/* Specialties Section */}
        <section className="mt-10 w-full max-w-3xl text-center">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Specialties
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Cancer Care",
              "ENT",
              "Dental Care",
              "Gastrointestinal",
              "Dermatology",
              "Infertility & IVF",
              "Cardiology",
              "Lung Transplant",
              "Neurology",
              "Orthopedics",
              "Pediatrics",
              "Psychiatry",
              "Urology",
              "More...",
            ].map((specialty) => (
              <div
                key={specialty}
                className="p-4 bg-white border border-gray-200 rounded-md shadow-sm text-gray-800"
              >
                {specialty}
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Home;
