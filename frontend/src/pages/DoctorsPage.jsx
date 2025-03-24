import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DoctorsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctors = location.state?.doctors || [];
  const specialization = location.state?.specializations || "";
  const disease = location.state?.disease || "";
  const confidence = location.state?.confidence || "";
  console.log("Received Specializations:", specialization);
  console.log("Received Doctors:", doctors);
  console.log("Received Doctors:", confidence);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 🩺 Specialization Search Message */}
      {specialization && (
        <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-md shadow">
          <h3 className="text-lg font-semibold">
            Predicted disease{" "}<span className="font-bold">{disease}</span> and recommended specialist is <span className="font-bold">{specialization}</span>
          </h3>
          
        </div>
      )}

      {/* Available Doctors Section */}
      <h2 className="text-2xl font-bold mb-4">Available Doctors</h2>
      {doctors.length === 0 ? (
        <p className="text-gray-600">
          No doctors found for this specialization.
        </p>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="flex items-center p-4 border rounded-lg shadow-md bg-white cursor-pointer hover:shadow-lg"
              onClick={() =>
                navigate(`/doctor/${doctor._id}`, { state: { doctor } })
              }
            >
              <img
                src={`http://localhost:5001/uploads/${doctor.profilePicture}`}
                alt="Doctor"
                className="w-24 h-24 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">{doctor.username}</h3>
                <p className="text-gray-600">{doctor.specialization}</p>
                <p className="text-gray-500">
                  {doctor.location} | {doctor.hospital}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
