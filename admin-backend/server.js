require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminAppointmentRoutes = require("./Routes/Admin-Appointment");
const Employee=require("../admin-backend/Routes/Admin-Employee")
const app = express();

// Middleware
const FRONTEND_URL = process.env.ADMIN_FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection with Retry
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Routes (no admin authentication)
app.use("/api/admin/appointments", adminAppointmentRoutes);
app.use("/api/employees",Employee);
// Start server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => console.log(`🚀 Admin server running on port ${PORT}`));

// Graceful shutdown handling
const shutdown = async () => {
  console.log("⚠️ Shutting down admin server...");
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    server.close(() => {
      console.log("✅ Admin server shutdown complete");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});
