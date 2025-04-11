const express = require("express");
const router = express.Router();
const Appointment = require("../Models/Appointment");

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    const formattedAppointments = appointments.map((appt) => ({
      _id: appt._id.toString(),
      user: appt.user, // Return user ID as is (ObjectId)
      services: appt.services,
      date: appt.date,
      time: appt.time,
      number: appt.number,
      phone: appt.phone,
      serviceOption: appt.serviceOption,
      status: appt.status,
      createdAt: appt.createdAt,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error while fetching appointments" });
  }
});

// PATCH accept an appointment (set status to "Accepted" from "Pending")
router.patch("/accept/:id", async (req, res) => {
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
      user: updatedAppointment.user,
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      createdAt: updatedAppointment.createdAt,
    });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    res.status(500).json({ message: "Server error while accepting appointment" });
  }
});

// PATCH set an appointment to "In Progress" (from "Accepted")
router.patch("/in-progress/:id", async (req, res) => {
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
      user: updatedAppointment.user,
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      createdAt: updatedAppointment.createdAt,
    });
  } catch (error) {
    console.error("Error setting appointment to In Progress:", error);
    res.status(500).json({ message: "Server error while setting appointment to In Progress" });
  }
});

// PATCH complete an appointment (set status to "Completed" from "In Progress")
router.patch("/complete/:id", async (req, res) => {
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
      user: updatedAppointment.user,
      services: updatedAppointment.services,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      number: updatedAppointment.number,
      phone: updatedAppointment.phone,
      serviceOption: updatedAppointment.serviceOption,
      status: updatedAppointment.status,
      createdAt: updatedAppointment.createdAt,
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Server error while completing appointment" });
  }
});

module.exports = router;