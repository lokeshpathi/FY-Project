import React from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import About from "./pages/About";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorProfile from "./pages/DoctorProfile";
import { AuthProvider } from "./context/Authcontext";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminDashboard from "./components/Admin"

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={<AdminDashboard/>}></Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/find-doctors" element={<DoctorsPage />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
        </Route>
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
