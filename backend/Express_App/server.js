require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const { Patient, RegisteredDoctor } = require("./models/User");
const Appointment = require("./models/Appointment");
const Availability = require("./models/Availability");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve profile pictures

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/doctor_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("MongoDB connected");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📌 REGISTER API (Patient & Doctor)
// 📌 REGISTER API (Patient & Doctor)
app.post("/api/register", upload.single("profilePicture"), async (req, res) => {
  try {
    const {
      username,
      email,
      role,
      password,
      confirmPassword,
      licenseNo,
      specialization,
      experience,
      hospital,
      address,
      location,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "patient") {
      // ✅ Patient Registration
      const newPatient = new Patient({
        username,
        email,
        password: hashedPassword,
      });
      await newPatient.save();

      return res.json({ message: "Patient registered successfully!" });
    } else {
      // ✅ Doctor Registration (Pending Verification)
      const profilePicture = req.file ? req.file.filename : null;

      const newDoctor = new RegisteredDoctor({
        username,
        email,
        licenseNo,
        specialization,
        experience,
        hospital,
        address,
        profilePicture,
        location,
        password: hashedPassword, // ✅ Store hashed password
      });

      await newDoctor.save();

      return res.json({
        message: "Doctor registration submitted! Await admin approval.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Patient.findOne({ email });
    let role = "patient";

    if (!user) {
      const doctor = await RegisteredDoctor.findOne({ email });
      if (doctor) {
        if (doctor.status !== "verified") {
          return res.status(403).json({
            message:
              "Verification not yet complete. Please wait for admin approval.",
          });
        }

        if (!(await bcrypt.compare(password, doctor.password))) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        user = doctor;
        role = "doctor";
      }
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, "secret", {
      expiresIn: "1h",
    });

    // ✅ Add doctor details inside the `user` object even for patients (null for patients)
    const responseData = {
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role,
        doctor:
          role === "doctor"
            ? {
                id: user._id,
                username: user.username,
                email: user.email,
                licenseNo: user.licenseNo,
                specialization: user.specialization,
                experience: user.experience,
                hospital: user.hospital,
                address: user.address,
                profilePicture: user.profilePicture,
                location: user.location,
              }
            : null, // ✅ Ensure doctor data is part of user object
      },
    };

    res.json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/admin/patients", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// Get verified doctors
app.get("/api/admin/doctors/verified", async (req, res) => {
  const doctors = await RegisteredDoctor.find({ status: "verified"});
  res.json(doctors);
});

// Get unverified doctors
app.get("/api/admin/doctors/unverified", async (req, res) => {
  const doctors = await RegisteredDoctor.find({ status: "pending" });
  res.json(doctors);
});


// verify the doctor
app.post("/api/admin/verify-doctor", async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid Doctor ID" });
    }

    const updatedDoctor = await RegisteredDoctor.findByIdAndUpdate(
      doctorId,
      { status: "verified" },
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor successfully verified!", updatedDoctor });
  } catch (error) {
    console.error("Error in /api/admin/verify-doctor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📌 SEARCH DOCTORS BY SYMPTOMS (Calls Flask API)
app.post("/api/search", async (req, res) => {
  const { symptoms, location } = req.body;

  if (!symptoms || symptoms.length === 0) {
    return res.status(400).json({ error: "No symptoms provided" });
  }
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    console.log("🔍 Symptoms Received:", symptoms);
    console.log("🔍 Location Received:", location);

    const symptomObject = {};
    symptoms.forEach((symptom) => {
      symptomObject[symptom] = "Yes"; // Convert array into expected object format
    });

    // Step 1: Send symptoms to Flask for disease prediction
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5000/predict",
      symptomObject // ✅ Send object with "Yes" values for selected symptoms
    );
    const { predicted_disease, doctor_specializations, confidence } =
      flaskResponse.data;
    console.log("🩺 Flask Response:", flaskResponse);

    // Step 2: Find only verified doctors in RegisteredDoctor model
    const doctors = await RegisteredDoctor.find({
      specialization: { $in: doctor_specializations },
      location: location,
      status: "verified",
    });

    console.log("✅ Doctors Found:", doctors);
    console.log("✅ confidence", confidence);
    console.log("✅ Specializations Returned:", doctor_specializations);

    // Step 3: Return response to React
    res.json({
      confidence,
      predicted_disease,
      doctor_specializations: doctor_specializations.join(", "), // Convert array to string
      doctors,
    });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Error retrieving doctors." });
  }
});

// 📌 SEARCH DOCTORS BY SPECIALIZATION
app.post("/api/search-specialization", async (req, res) => {
  const { specialization, location } = req.body;

  if (!specialization) {
    return res.status(400).json({ error: "Specialization is required" });
  }
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    // Find only verified doctors with the given specialization and location
    const doctors = await RegisteredDoctor.find({
      specialization: specialization,
      location: location,
      status: "verified", // ✅ Ensures only verified doctors are fetched
    });

    res.json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Error retrieving doctors." });
  }
});

app.post("/api/book-appointment", async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    // Validate inputs
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch patient details from the database
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if the time slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
    });
    if (existingAppointment) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Create the appointment
    const newAppointment = new Appointment({
      patientId,
      patientName: patient.username, // Use patient details from DB
      patientEmail: patient.email,
      doctorId,
      date,
      time,
    });

    await newAppointment.save();
    res.json({ message: "Appointment booked successfully!" });
  } catch (error) {
    console.error("Error in booking appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Fetch Appointments (Upcoming & History)
app.get("/api/doctor/appointments", async (req, res) => {
  try {
    const { doctorId, type } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    let filter = { doctorId };

    if (type === "upcoming") {
      filter.status = "pending";
    } else if (type === "history") {
      filter.status = { $in: ["completed", "cancelled"] };
    }

    const appointments = await Appointment.find(filter).populate(
      "patientId",
      "username email"
    );

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Update Appointment Status (Confirm/Cancel)
app.patch("/api/doctor/appointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedAppointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: `Appointment ${status}`, updatedAppointment });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/availability/create", async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime } = req.body;
    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const availability = new Availability({
      doctorId,
      date,
      startTime,
      endTime,
    });

    await availability.save();
    res
      .status(201)
      .json({ message: "Availability created successfully", availability });
  } catch (error) {
    console.error("❌ Error creating availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Availability for a Doctor
app.get("/api/availability/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availability = await Availability.find({ doctorId });
    res.status(200).json(availability);
  } catch (error) {
    console.error("❌ Error fetching availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete Availability
app.delete("/api/availability/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Availability.findByIdAndDelete(id);
    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Update Doctor Profile
app.patch("/api/doctor/profile", async (req, res) => {
  try {
    const { doctorId, username, specialization, hospital, address, location } =
      req.body;

    const updatedDoctor = await RegisteredDoctor.findByIdAndUpdate(
      doctorId,
      { username, specialization, hospital, address, location },
      { new: true }
    );

    if (!updatedDoctor)
      return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Profile updated successfully", updatedDoctor });
  } catch (error) {
    console.error("❌ Error updating doctor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/doctor/availability", async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    const slots = await Availability.find({
      doctorId,
      date,
      // isBooked: false, // ✅ Only return unbooked slots
    });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available slots" });
  }
});

// 📌 Set Doctor Availability
app.post("/api/doctor/set-availability", async (req, res) => {
  try {
    const { doctorId, availableSlots } = req.body;
    if (!doctorId || !availableSlots)
      return res.status(400).json({ message: "Missing required fields" });

    const doctor = await RegisteredDoctor.findByIdAndUpdate(
      doctorId,
      { availableSlots },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Availability set successfully", doctor });
  } catch (error) {
    console.error("❌ Error setting availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get Doctor Availability
app.get("/api/doctor/availability", async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId)
      return res.status(400).json({ message: "Doctor ID is required" });

    const doctor = await RegisteredDoctor.findById(doctorId, "availableSlots");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ availableSlots: doctor.availableSlots });
  } catch (error) {
    console.error("❌ Error fetching availability:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE /api/admin/patients/:id
app.delete("/api/admin/patients/:id", async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting patient" });
  }
});

app.delete("/api/admin/doctors/:id", async (req, res) => {
  console.log(req.params.id)
  try {
    const deletedDoctor = await RegisteredDoctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting doctor" });
  }
});



// Start server
app.listen(5001, () => console.log("Server running on port 5001"));
