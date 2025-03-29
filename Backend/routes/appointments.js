const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Vehicle = require("../models/Vehicle");
const auth = require("../middleware/authMiddleware");

// Maximum appointments per day
const MAX_APPOINTMENTS_PER_DAY = 8;

// Get all appointments for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new appointment
router.post("/", auth, async (req, res) => {
  const { services, date, time, number, phone, serviceOption } = req.body;

  try {
    // Validate vehicle exists for the user
    const vehicle = await Vehicle.findOne({ number, userId: req.user.id });
    console.log("Vehicle lookup:", { number, userId: req.user.id, found: vehicle });
    if (!vehicle) {
      return res.status(400).json({ message: "Vehicle not found or does not belong to you" });
    }

    // Check if this vehicle is already used in any appointment for this user
    const vehicleInUse = await Appointment.findOne({
      number,
      user: req.user.id,
    });
    if (vehicleInUse) {
      return res.status(400).json({ message: "Duplicate vehicle entry detected" });
    }

    // Check for duplicate appointment (same vehicle, date, and time)
    const existingAppointment = await Appointment.findOne({
      number,
      date,
      time,
      user: req.user.id,
    });
    if (existingAppointment) {
      return res.status(400).json({ message: "An appointment already exists for this vehicle at this time" });
    }

    // Check daily appointment limit
    const appointmentsOnDate = await Appointment.countDocuments({ date });
    if (appointmentsOnDate >= MAX_APPOINTMENTS_PER_DAY) {
      return res.status(400).json({ message: "Maximum appointments reached for this date" });
    }

    const appointment = new Appointment({
      user: req.user.id,
      services,
      date,
      time,
      number,
      phone,
      serviceOption,
      status: "Appointment Successfull", // Default as per schema, adjust if needed
    });
    console.log("New appointment:", appointment);
    const savedAppointment = await appointment.save();
    res.status(201).json({
      appointment: savedAppointment,
      message: "Appointment successfully created", // Success message
    });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Update an appointment
router.put("/:id", auth, async (req, res) => {
  const { services, date, time, number, phone, serviceOption } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure the appointment belongs to the user
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    // Validate vehicle exists
    const vehicle = await Vehicle.findOne({ number, userId: req.user.id });
    if (!vehicle) {
      return res.status(400).json({ message: "Vehicle not found or does not belong to you" });
    }

    // Check for conflicting appointments (excluding this one)
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      number,
      date,
      time,
      user: req.user.id,
    });
    if (conflictingAppointment) {
      return res.status(400).json({ message: "Another appointment exists for this vehicle at this time" });
    }

    // Check daily limit (excluding this appointment’s original date)
    if (appointment.date !== date) {
      const appointmentsOnNewDate = await Appointment.countDocuments({ date });
      if (appointmentsOnNewDate >= MAX_APPOINTMENTS_PER_DAY) {
        return res.status(400).json({ message: "Maximum appointments reached for the new date" });
      }
    }

    appointment.services = services;
    appointment.date = date;
    appointment.time = time;
    appointment.number = number;
    appointment.phone = phone;
    appointment.serviceOption = serviceOption;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an appointment
router.delete("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure the appointment belongs to the user
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this appointment" });
    }

    await Appointment.deleteOne({ _id: req.params.id });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;