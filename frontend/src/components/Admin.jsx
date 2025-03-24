import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/admin/patients"
      );
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const verifiedResponse = await axios.get(
        "http://localhost:5001/api/admin/doctors/verified"
      );
      const unverifiedResponse = await axios.get(
        "http://localhost:5001/api/admin/doctors/unverified"
      );
      setVerifiedDoctors(verifiedResponse.data);
      setUnverifiedDoctors(unverifiedResponse.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const deletePatient = async (patientId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5001/api/admin/patients/${patientId}`
      );
      setPatients(patients.filter((patient) => patient._id !== patientId));
      console.log("Patient deleted successfully.");
    } catch (error) {
      console.error(
        "Error deleting patient:",
        error.response?.data || error.message
      );
    }
  };

  const deleteDoctor = async (doctorId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/api/admin/doctors/${doctorId}`);
      setVerifiedDoctors(
        verifiedDoctors.filter((doctor) => doctor._id !== doctorId)
      );
      setUnverifiedDoctors(
        unverifiedDoctors.filter((doctor) => doctor._id !== doctorId)
      );
      console.log("Doctor deleted successfully.");
    } catch (error) {
      console.error(
        "Error deleting doctor:",
        error.response?.data || error.message
      );
    }
  };

  const verifyDoctor = async (doctorId) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/admin/verify-doctor",
        {
          doctorId,
        }
      );

      alert("Doctor successfully verified!");
      fetchDoctors();

      // Update state to remove the verified doctor from the list
      setUnverifiedDoctors((prevDoctors) =>
        prevDoctors.filter((doctor) => doctor._id !== doctorId)
      );
    } catch (error) {
      console.error("Error verifying doctor:", error);
      alert(error.response?.data?.message || "Failed to verify doctor");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patients Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Registered Patients ({patients.length})
          </h2>
          <ul className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <li
                key={patient._id}
                className="py-2 flex justify-between items-center"
              >
                <span className="w-1/3 font-medium">
                  {patient.username.charAt(0).toUpperCase() +
                    patient.username.slice(1)}
                </span>
                <span>{patient.email}</span>
                <button
                  className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
                  onClick={() => deletePatient(patient._id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Verified Doctors Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Verified Doctors ({verifiedDoctors.length})
          </h2>
          <ul className="divide-y divide-gray-200">
            {verifiedDoctors.map((doctor) => (
              <li
                key={doctor._id}
                className="py-2 flex items-center justify-between"
              >
                <span className="w-1/3 font-medium text-blue-600">
                  {doctor.username.charAt(0).toUpperCase() +
                    doctor.username.slice(1)}
                </span>
                <span>{doctor.specialization}</span>
                <div className="flex gap-3">
                  <button
                    className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
                    onClick={() => deleteDoctor(doctor._id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Unverified Doctors Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Unverified Doctors ({unverifiedDoctors.length})
        </h2>
        <ul className="divide-y divide-gray-200">
          {unverifiedDoctors.map((doctor) => (
            <li
              key={doctor._id}
              className="py-2 flex items-center justify-between"
            >
              <span className="w-1/3 font-medium text-blue-600">
                {doctor.username}
              </span>
              <span className="w-1/3 text-gray-700">
                {doctor.specialization}
              </span>
              <div className="w-1/3 flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  View
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition"
                  onClick={() => verifyDoctor(doctor._id)}
                >
                  Verify
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
                  onClick={() => deleteDoctor(doctor._id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-4">
              {selectedDoctor.username}
            </h2>
            <p>
              <strong>Specialization:</strong> {selectedDoctor.specialization}
            </p>
            <p>
              <strong>Experience:</strong> {selectedDoctor.experience} years
            </p>
            <p>
              <strong>Hospital:</strong> {selectedDoctor.hospital}
            </p>
            <p>
              <strong>Location:</strong> {selectedDoctor.location}
            </p>
            <p>
              <strong>License No:</strong> {selectedDoctor.licenseNo}
            </p>
            <p>
              <strong>Email:</strong> {selectedDoctor.email}
            </p>
            <p>
              <strong>Address:</strong> {selectedDoctor.address}
            </p>
            <p
              className={`text-${
                selectedDoctor.status === "verified" ? "green" : "red"
              }-600 font-medium`}
            >
              Status: {selectedDoctor.status}
            </p>
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() => setSelectedDoctor(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
