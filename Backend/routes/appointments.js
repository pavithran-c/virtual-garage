// routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

const MAX_APPOINTMENTS_PER_DAY = 8;

router.get('/', async (req, res) => {
  try {
    console.log('Fetching appointments for user:', req.user.id);
    const appointments = await Appointment.find({ userId: req.user.id });
    console.log('Appointments found:', appointments);
    res.json(appointments);
  } catch (error) {
    console.error('GET /api/appointments error:', error.stack);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { service, date, time, number } = req.body;
  console.log('POST /api/appointments request body:', req.body);
  console.log('User ID from token:', req.user.id);

  if (!service || !date || !time || !number) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const appointmentsOnDate = await Appointment.countDocuments({ date });
    console.log(`Appointments on ${date}: ${appointmentsOnDate}`);
    if (appointmentsOnDate >= MAX_APPOINTMENTS_PER_DAY) {
      return res.status(400).json({
        message: `Maximum ${MAX_APPOINTMENTS_PER_DAY} appointments reached for ${date}`,
      });
    }

    const newAppointment = new Appointment({
      userId: req.user.id,
      service,
      date,
      time,
      number,
    });
    console.log('Saving new appointment:', newAppointment);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('POST /api/appointments error:', error.stack);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Vehicle number already has an appointment' });
    } else {
      res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
  }
});

// PUT and DELETE routes remain unchanged but add similar logging if needed

module.exports = router;