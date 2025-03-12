const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM AM/PM
  number: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);