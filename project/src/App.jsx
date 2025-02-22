import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginSignup from "../src/Login/Login";
import HomePage from "./Components/Home/Home";
import ServicesPage from "./Components/Services/Service";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import AuthProvider, { AuthContext } from "./context/AuthContext"; // Import AuthProvider

// Get client ID from environment variable
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Protected Route Component (checks context instead of localStorage)
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/" />;
};

const App = () => {
  if (!clientId) {
    console.error('Google Client ID is not configured');
    return <div>Error: Google OAuth is not configured properly</div>;
  }

  return (
    <GoogleOAuthProvider 
      clientId={clientId}
      onScriptLoadError={() => {
        console.error('Google OAuth script failed to load');
      }}
      onScriptLoadSuccess={() => {
        console.log('Google OAuth script loaded successfully');
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginSignup />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <HomePage />
                  <Footer />
                </ProtectedRoute>
              }
            />
            <Route path="/services" element={
              <ProtectedRoute>
                <Navbar />
                <ServicesPage />
                <Footer />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
