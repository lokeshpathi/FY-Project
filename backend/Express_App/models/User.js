const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const RegisteredDoctorSchema = new mongoose.Schema({
  username: String,
  email: String,
  licenseNo: String,
  specialization: String,
  experience: Number,
  hospital: String,
  address: String,
  profilePicture: String,
  location:String,
  password:String,
  status: { type: String, default: "pending" }, // pending | verified
});


const Patient = mongoose.model("Patient", PatientSchema);
const RegisteredDoctor = mongoose.model("RegisteredDoctor", RegisteredDoctorSchema);


module.exports = { Patient, RegisteredDoctor };
