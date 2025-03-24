import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex justify-between items-center">
        {/* Clickable Logo to Redirect to Home */}
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition">
          LOGO
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-800 font-medium hover:text-blue-500 transition">
            Home
          </Link>
          <Link to="/about" className="text-gray-800 font-medium hover:text-blue-500 transition">
            About Us
          </Link>

          {/* Show Profile Dropdown if Logged In */}
          {user ? (
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-500 text-lg focus:outline-none">
                👤
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-4 text-center border-b">
                  <p className="font-semibold text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    window.location.reload(); // Force update navbar
                  }}
                  className="block w-full px-4 py-2 text-red-600 text-center hover:bg-red-100 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
              Login / Signup
            </Link>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-20 flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full bg-gray-900 text-white text-center py-4">
        <p>&copy; 2025 Company Name | SMVDU, Kakryal, Katra</p>
      </footer>
    </div>
  );
};

export default Layout;
