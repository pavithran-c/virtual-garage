import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load from localStorage if available
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Set up axios defaults
  useEffect(() => {
    if (user && user.token) {
      // Set default Authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      // Clear the header when no user is logged in
      delete axios.defaults.headers.common['Authorization'];
      console.log('Cleared Authorization header');
    }
  }, [user]);

  const login = (userData) => {
    console.log('Login data received:', userData);
    
    // Ensure we have a token
    if (!userData.token) {
      console.error('No token received during login');
    }
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Store user in localStorage
    
    // Set the Authorization header when logging in
    if (userData && userData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear on logout
    
    // Clear the Authorization header when logging out
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    // Sync user state with localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Set the Authorization header on initial load
      if (userData && userData.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
