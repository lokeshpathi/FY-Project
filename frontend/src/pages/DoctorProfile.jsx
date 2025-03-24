import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/Authcontext"; // Import AuthContext

const DoctorProfile = () => {
  const location = useLocation();
  const doctor = location.state?.doctor;
  const { user } = useContext(AuthContext); // ✅ Get logged-in user details

  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState("");

  if (!doctor) return <p className="text-center mt-6 text-gray-600">Doctor not found.</p>;

  const today = new Date().toISOString().split("T")[0];

  // ✅ Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  // ✅ Fetch available slots from backend
  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/doctor/availability`, {
        params: { doctorId: doctor._id, date: selectedDate },
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch available slots:", error);
      setAvailableSlots([]);
    }
  };

  // ✅ Handle Booking
  const handleBooking = async () => {
    setError(""); // Reset error message

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }

    if (!user) {
      setError("You must be logged in to book an appointment.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/book-appointment", {
        patientId: user.id,
        doctorId: doctor._id,
        date: selectedDate,
        time: selectedTime,
      });

      if (response.data.message) {
        setIsBooked(true);
        setTimeout(() => setIsBooked(false), 3000);
        fetchAvailableSlots(); // ✅ Refresh available slots after booking
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to book appointment");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg flex flex-col gap-6">
      {/* Doctor Details */}
      <div className="flex gap-6">
        <img
          src={`http://localhost:5001/uploads/${doctor.profilePicture}`}
          alt={doctor.username}
          className="w-48 h-48 rounded-lg object-cover shadow-md"
        />
        <div className="flex-1">
          <h2 className="text-3xl font-bold capitalize text-gray-800">{doctor.username}</h2>
          <p className="text-lg text-gray-600">{doctor.specialization}</p>
          <p className="mt-2 text-sm text-gray-500">
            Status: <span className="font-medium text-green-600">{doctor.status}</span>
          </p>
          <div className="mt-4 space-y-2 text-gray-700">
            <p><strong>Experience:</strong> {doctor.experience} years</p>
            <p><strong>Location:</strong> {doctor.location}</p>
            <p><strong>Clinic:</strong> {doctor.hospital}</p>
            <p><strong>License No:</strong> {doctor.licenseNo}</p>
            <p><strong>Email:</strong> {doctor.email}</p>
            <p><strong>Address:</strong> {doctor.address}</p>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800">Book an Appointment</h3>
        
        {/* ✅ Date Picker */}
        <div className="mt-3">
          <label className="block text-gray-600 font-medium">Select Date</label>
          <input
            type="date"
            className="mt-1 p-2 w-full border rounded-lg"
            value={selectedDate}
            min={today}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* ✅ Time Slot Dropdown */}
        <div className="mt-3">
          <label className="block text-gray-600 font-medium">Select Time</label>
          <select
            className="mt-1 p-2 w-full border rounded-lg"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={!availableSlots.length}
          >
            <option value="">Select a time slot</option>
            {availableSlots.map((slot, index) => (
              <option key={index} value={slot.time}>
                {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>
          {availableSlots.length === 0 && selectedDate && (
            <p className="text-red-500 mt-1">No slots available for this date.</p>
          )}
        </div>

        {/* ✅ Book Button */}
        <button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Confirm Appointment
        </button>

        {isBooked && (
          <p className="mt-3 text-green-600 text-center font-medium">
            Appointment booked for {selectedDate} at {selectedTime}!
          </p>
        )}
        {error && <p className="mt-3 text-red-600 text-center font-medium">{error}</p>}
      </div>
    </div>
  );
};

export default DoctorProfile;
