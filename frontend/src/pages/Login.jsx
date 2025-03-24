import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/Authcontext";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("patient");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
    licenseNo: "",
    specialization: "",
    experience: "",
    hospital: "",
    address: "",
    location: "",
  });

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle File Upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  // ✅ Handle Form Submission

  const fileInputRef = useRef(null); // ✅ Create a ref for file input

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const url = isLogin ? "/api/login" : "/api/register";
      let data;
      let headers = { "Content-Type": "application/json" };

      if (!isLogin && role === "doctor") {
        if (!formData.profilePicture) {
          setMessage("Profile picture is required for doctor registration.");
          return;
        }

        data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key]) {
            data.append(key, formData[key]);
          }
        });
        data.append("role", role);
        data.append("status", "pending");
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        data = JSON.stringify({ ...formData, role });
      }

      const response = await axios.post(`http://localhost:5001${url}`, data, {
        headers,
      });

      setMessage(response.data.message);

      if (isLogin) {
        login(response.data.user, response.data.token);
        navigate(
          response.data.user.role === "doctor" ? "/doctor-dashboard" : "/"
        );
      } else {
        // ✅ Reset form state
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          profilePicture: null,
          licenseNo: "",
          specialization: "",
          experience: "",
          hospital: "",
          address: "",
          location: "",
        });

        // ✅ Reset file input field
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? "Login" : "Register"}
      </h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}

      {/* ✅ Role Selection (Only for Registration) */}
      {!isLogin && (
        <div className="mb-4">
          <label className="block font-bold">Select Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="text-left">
            <label className="block font-bold">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        )}

        <div className="text-left">
          <label className="block font-bold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* ✅ Doctor-specific fields (Only for Registration) */}
        {role === "doctor" && !isLogin && (
          <>
            <div className="text-left">
              <label className="block font-bold">Profile Picture</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
                required
              />
            </div>
            <div className="text-left">
              <label className="block font-bold">License Number</label>
              <input
                type="text"
                name="licenseNo"
                value={formData.licenseNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="text-left">
              <label className="block font-bold">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="text-left">
              <label className="block font-bold">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="text-left">
              <label className="block font-bold">Hospital</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="text-left">
              <label className="block font-bold">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="text-left">
              <label className="block font-bold">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </>
        )}

        <div className="text-left">
          <label className="block font-bold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {!isLogin && (
          <div className="text-left">
            <label className="block font-bold">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p
          onClick={() => {
            setIsLogin((prev) => !prev);
            setMessage("")
          }}
          className="mt-4 text-blue-500 cursor-pointer text-sm hover:underline"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
};

export default Auth;
