const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  number: { type: String, required: true }, // No unique constraint; users can have duplicate numbers
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);