const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  services: { type: [String], required: true }, // Changed to array of strings
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM AM/PM
  number: { type: String, required: true } // Removed unique constraint (adjust if needed)
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);