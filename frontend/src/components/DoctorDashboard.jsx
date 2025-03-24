import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [historyAppointments, setHistoryAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (user?.id && activeTab === "availability") {
      fetchAvailability();
    }
  }, [user?.id, activeTab]);

  // ✅ Fetch Appointments on Load
  useEffect(() => {
    if (user?.id) {
      fetchAppointments("upcoming");
      fetchAppointments("history");
    }
  }, [user?.id]);

  // ✅ Fetch Availability
  const fetchAvailability = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/availability/doctor/${user.id}`
      );
      setAvailability(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch availability:", error);
    }
  };

  // ✅ Add Availability
  const addAvailability = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      alert("All fields are required");
      return;
    }

    try {
      await axios.post("http://localhost:5001/api/availability/create", {
        doctorId: user.id,
        date,
        startTime,
        endTime,
      });
      setDate("");
      setStartTime("");
      setEndTime("");
      fetchAvailability(); // Refresh availability after adding
    } catch (error) {
      console.error("❌ Failed to add availability:", error);
    }
  };

  // ✅ Delete Availability
  const deleteAvailability = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/availability/${id}`);
      fetchAvailability(); // Refresh availability after deletion
    } catch (error) {
      console.error("❌ Failed to delete availability:", error);
    }
  };

  // ✅ Fetch Appointments
  const fetchAppointments = async (type) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/doctor/appointments?doctorId=${user.id}&type=${type}`
      );
      if (type === "upcoming") {
        setUpcomingAppointments(response.data);
      } else if (type === "history") {
        setHistoryAppointments(response.data);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${type} appointments:`, error);
    }
  };

  // ✅ Update Appointment Status
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5001/api/doctor/appointment/${id}`, {
        status,
      });
      fetchAppointments("upcoming");
      fetchAppointments("history");
    } catch (error) {
      console.error("❌ Failed to update appointment:", error);
    }
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ✅ Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <ul className="space-y-4">
          <li
            onClick={() => setActiveTab("upcoming")}
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "upcoming"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Upcoming Appointments
          </li>
          <li
            onClick={() => setActiveTab("history")}
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "history"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Appointment History
          </li>
          <li
            onClick={() => setActiveTab("availability")}
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "availability"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Set Availability
          </li>
        </ul>
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 p-6">
        {/* ✅ Profile Section */}
        <div className="flex justify-end mb-4 relative">
          <img
            src={
              user?.doctor?.profilePicture
                ? `http://localhost:5001/uploads/${user.doctor.profilePicture}`
                : "/default-avatar.png"
            }
            alt="Profile"
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />
          {showProfileMenu && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 top-14 w-64 bg-white shadow-lg rounded-md p-4 z-50"
            >
              <p className="font-bold text-lg">
                {user.doctor?.username || "Doctor"}
              </p>
              <p className="text-gray-600">
                {user.doctor?.specialization || "No Specialization"}
              </p>
              <p className="text-gray-600">
                {user.doctor?.hospital || "No Hospital"}
              </p>
              <p className="text-gray-600">
                {user.doctor?.location || "No Location"}
              </p>
              <button
                onClick={handleLogout}
                className="mt-3 w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* ✅ Upcoming Appointments */}
        {activeTab === "upcoming" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <li
                    key={appointment._id}
                    className="p-4 bg-white shadow rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">
                        {appointment.patientId?.username}
                      </p>
                      <p className="text-gray-500">{appointment.date}</p>
                      <p className="text-gray-500">{appointment.time}</p>
                      <p className="text-gray-500">
                        Status: {appointment.status}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          updateAppointmentStatus(appointment._id, "completed")
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() =>
                          updateAppointmentStatus(appointment._id, "cancelled")
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No upcoming appointments.</p>
            )}
          </div>
        )}

        {/* ✅ Appointment History */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Appointment History</h2>
            {historyAppointments.length > 0 ? (
              <ul className="space-y-4">
                {historyAppointments.map((appointment) => (
                  <li
                    key={appointment._id}
                    className="p-4 bg-white shadow rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">
                        {appointment.patientId?.username}
                      </p>
                      <p className="text-gray-500">{appointment.date}</p>
                      <p className="text-gray-500">{appointment.time}</p>
                      <p className="text-gray-500">
                        Status: {appointment.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No appointment history.</p>
            )}
          </div>
        )}

        {/* ✅ Availability Section */}
        {activeTab === "availability" && (
          <div className="w-[75%] mx-auto">
            <h2 className="text-xl font-bold mb-4">Set Availability</h2>
            <form onSubmit={addAvailability} className="space-y-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
                min={new Date().toISOString().split("T")[0]} // ✅ Disable past dates
              />

              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Availability
              </button>
            </form>

            {/* ✅ Display Existing Availability */}
            <ul className="mt-4 space-y-2">
              {availability.length > 0 ? (
                availability.map((slot) => (
                  <li key={slot._id} className="p-2 bg-white shadow rounded-md">
                    {slot.date} | {slot.startTime} - {slot.endTime}
                    <button
                      onClick={() => deleteAvailability(slot._id)}
                      className="ml-4 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No availability slots added.</p>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
