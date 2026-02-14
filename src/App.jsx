import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TruckManagement from "./pages/TruckManagement";
import DriverManagement from "./pages/DriverManagement";
import TripManagement from "./pages/TripManagement";
import TripDetail from "./pages/TripDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DuePayments from "./pages/DuePayments";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated (you can replace this with your auth logic)
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/trucks" element={<TruckManagement />} />
                      <Route path="/drivers" element={<DriverManagement />} />
                      <Route path="/trips" element={<TripManagement />} />
                      <Route path="/trips/:id" element={<TripDetail />} />
                      <Route path="/due-payments" element={<DuePayments />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
