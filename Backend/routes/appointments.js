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
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new appointment
router.post("/", auth, async (req, res) => {
  const { services, date, time, number, phone, serviceOption } = req.body;

  try {
    // Validate required fields
    if (!services || !date || !time || !number || !phone) {
      return res.status(400).json({ message: "All fields (services, date, time, number, phone) are required" });
    }

    // Validate vehicle exists for the user
    const vehicle = await Vehicle.findOne({ number, userId: req.user.id });
    if (!vehicle) {
      return res.status(400).json({ message: "Vehicle not found or does not belong to you" });
    }

    // Check for duplicate appointment (same vehicle, date, and time), excluding Completed ones
    const existingAppointment = await Appointment.findOne({
      number,
      date,
      time,
      user: req.user.id,
      status: { $ne: "Completed" }, // Only block if not Completed
    });
    if (existingAppointment) {
      return res.status(400).json({ message: "An active appointment already exists for this vehicle at this time" });
    }

    // Check daily appointment limit
    const appointmentsOnDate = await Appointment.countDocuments({ date, status: { $ne: "Completed" } });
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
      status: "Pending", // Default status set to "Pending" for consistency
    });

    const savedAppointment = await appointment.save();
    res.status(201).json({
      appointment: savedAppointment,
      message: "Appointment successfully created",
    });
  } catch (err) {
    console.error("Error creating appointment:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Update an appointment
router.put("/:id", auth, async (req, res) => {
  const { services, date, time, number, phone, serviceOption, status } = req.body;

  try {
    // Validate required fields
    if (!services || !date || !time || !number || !phone) {
      return res.status(400).json({ message: "All fields (services, date, time, number, phone) are required" });
    }

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

    // Check for conflicting appointments (excluding this one), only if not Completed
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      number,
      date,
      time,
      user: req.user.id,
      status: { $ne: "Completed" },
    });
    if (conflictingAppointment) {
      return res.status(400).json({ message: "Another active appointment exists for this vehicle at this time" });
    }

    // Check daily limit (excluding this appointment’s original date if it’s not Completed)
    if (appointment.date !== date && appointment.status !== "Completed") {
      const appointmentsOnNewDate = await Appointment.countDocuments({ date, status: { $ne: "Completed" } });
      if (appointmentsOnNewDate >= MAX_APPOINTMENTS_PER_DAY) {
        return res.status(400).json({ message: "Maximum appointments reached for the new date" });
      }
    }

    // Update fields
    appointment.services = services;
    appointment.date = date;
    appointment.time = time;
    appointment.number = number;
    appointment.phone = phone;
    appointment.serviceOption = serviceOption;
    if (status) appointment.status = status; // Allow status update if provided

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (err) {
    console.error("Error updating appointment:", err);
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
    console.error("Error deleting appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;