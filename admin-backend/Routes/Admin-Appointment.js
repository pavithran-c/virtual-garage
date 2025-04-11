const express = require("express");
const router = express.Router();
const Appointment = require("../Models/Appointment");

// Middleware to check admin authentication (assuming Basic Auth as per frontend)
const authAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== "Basic " + Buffer.from("admin:admin123").toString("base64")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// GET all appointments
router.get("/", authAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    const formattedAppointments = appointments.map((appt) => ({
      _id: appt._id.toString(),
      user: appt.user.toString(), // Return user ID as string (ObjectId)
      username: appt.username || appt.user.toString(), // Fallback to user ID if username not available
      services: appt.services,
      date: appt.date,
      time: appt.time,
      number: appt.number,
      phone: appt.phone,
      serviceOption: appt.serviceOption,
      status: appt.status,
      changeRequested: appt.changeRequested || false,
      changeReason: appt.changeReason || null,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error while fetching appointments" });
  }
});

// PATCH accept an appointment (set status to "Accepted" from "Pending")
router.patch("/accept/:id", authAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "Pending") {
      return res.status(400).json({ message: "Only Pending appointments can be accepted" });
    }

    appointment.status = "Accepted";
    const updatedAppointment = await appointment.save();

    res.json({
      _id: updatedAppointment._id.toString(),
      user: updatedAppointment.user.toString(),
      username: updatedAppointment.username || updatedAppointment.user.toString(),
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      changeRequested: updatedAppointment.changeRequested || false,
      changeReason: updatedAppointment.changeReason || null,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    res.status(500).json({ message: "Server error while accepting appointment" });
  }
});

// PATCH set an appointment to "In Progress" (from "Accepted")
router.patch("/in-progress/:id", authAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "Accepted") {
      return res.status(400).json({ message: "Only Accepted appointments can be set to In Progress" });
    }

    appointment.status = "In Progress";
    const updatedAppointment = await appointment.save();

    res.json({
      _id: updatedAppointment._id.toString(),
      user: updatedAppointment.user.toString(),
      username: updatedAppointment.username || updatedAppointment.user.toString(),
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      changeRequested: updatedAppointment.changeRequested || false,
      changeReason: updatedAppointment.changeReason || null,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    });
  } catch (error) {
    console.error("Error setting appointment to In Progress:", error);
    res.status(500).json({ message: "Server error while setting appointment to In Progress" });
  }
});

// PATCH complete an appointment (set status to "Completed" from "In Progress")
router.patch("/complete/:id", authAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "In Progress") {
      return res.status(400).json({ message: "Only In Progress appointments can be completed" });
    }

    appointment.status = "Completed";
    const updatedAppointment = await appointment.save();

    res.json({
      _id: updatedAppointment._id.toString(),
      user: updatedAppointment.user.toString(),
      username: updatedAppointment.username || updatedAppointment.user.toString(),
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      changeRequested: updatedAppointment.changeRequested || false,
      changeReason: updatedAppointment.changeReason || null,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Server error while completing appointment" });
  }
});

// PATCH request date change for an appointment
router.patch("/:id", authAdmin, async (req, res) => {
  const { changeRequested, changeReason } = req.body;

  // Ensure both fields are provided for a date change request
  if (changeRequested === true && (!changeReason || changeReason.trim() === "")) {
    return res.status(400).json({ message: "Reason is required when requesting a date change" });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only update if changeRequested is explicitly true and a valid reason is provided
    if (changeRequested === true && changeReason) {
      appointment.changeRequested = true;
      appointment.changeReason = changeReason;
    } else if (changeRequested === false) {
      // Optionally allow resetting the request (if needed by frontend)
      appointment.changeRequested = false;
      appointment.changeReason = null;
    } // If changeRequested is undefined or invalid, no change is made

    const updatedAppointment = await appointment.save();
    res.json({
      _id: updatedAppointment._id.toString(),
      user: updatedAppointment.user.toString(),
      username: updatedAppointment.username || updatedAppointment.user.toString(),
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      changeRequested: updatedAppointment.changeRequested || false,
      changeReason: updatedAppointment.changeReason || null,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error while updating appointment" });
  }
});

module.exports = router;