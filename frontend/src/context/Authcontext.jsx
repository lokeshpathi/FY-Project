import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedDoctor = localStorage.getItem("doctor");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (parsedUser.role === "doctor" && storedDoctor) {
          setDoctor(JSON.parse(storedDoctor));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.clear();
      }
    }
  }, []);
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  
    // // ✅ Fix doctor-specific login handling
    // if (userData.role === "doctor" && userData.doctor) {
    //   setDoctor(userData.doctor);
    //   localStorage.setItem("doctor", JSON.stringify(userData.doctor));
    // } else {
    //   setDoctor(null);
    // }
  
    console.log("✅ User Logged In:", userData);
  };
  
  

  const logout = () => {
    setUser(null);
    setDoctor(null);
    localStorage.clear();

    // Redirect to login or refresh page
    if (window.location.pathname !== "/login") {
      navigate("/login");
    } else {
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, doctor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
