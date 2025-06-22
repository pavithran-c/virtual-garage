require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleroutes');
const appointmentRoutes = require('./routes/appointments');
const aiRoutes = require('./routes/AIroutes'); // Import AI routes
const user=require('./routes/user');
const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://friends-car-care.vercel.app/';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Log sanitized environment variables
console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
  FRONTEND_URL: process.env.FRONTEND_URL || 'Not Set',
  PORT: process.env.PORT || 'Not Set',
  WS_PORT: process.env.WS_PORT || 'Not Set',
});

// MongoDB Connection with Retry
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided, please log in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded._id,
      username: decoded.username,
    };
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token, please log in again' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', authMiddleware, vehicleRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api', aiRoutes); // Mount AI routes under /api
app.use("/api/user", user);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful shutdown handling
const shutdown = async () => {
  console.log('⚠️ Shutting down server...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});