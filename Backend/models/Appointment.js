const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  services: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one service is required",
    },
  },
  date: {
    type: String, // e.g., "2025-03-27"
    required: true,
  },
  time: {
    type: String, // e.g., "14:30"
    required: true,
  },
  number: {
    type: String, // Vehicle number (license plate)
    required: true,
    ref:"vehicles"
  },
  phone: {
    type: String,
    required: true,
    match: [
      /^(?:\+91|0)?[6-9]\d{9}$/,
      "Phone number must be a valid Indian number (e.g., 9876543210 or +919876543210)",
    ],
  },
  serviceOption: {
    type: String,
    enum: ["Home Service", "Pick Up & Delivery", "On-Spot Service"],
    default: "Pick Up & Delivery",
  },
  status: {
    type: String,
    enum: ["Appointment Successfull","Date Change Requested","Pending", "Accepted", "Completed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  changeRequested: { type: Boolean, default: false },
  changeReason: { type: String, default: null },
  assignedEmployee : {type: mongoose.Schema.Types.ObjectId, ref: "Employee"},
    updatedAt: {
      type: Date,
      default: Date.now,
    },
});

module.exports = mongoose.model("Appointment", appointmentSchema);