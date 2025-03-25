const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');
const MAX_APPOINTMENTS_PER_DAY = 8;

router.get('/', authMiddleware, async (req, res) => {
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

router.post('/', authMiddleware, async (req, res) => {
  const { services, date, time, number } = req.body; // Changed `service` to `services`
  console.log('POST /api/appointments request body:', req.body);
  console.log('User ID from token:', req.user.id);

  // Validate that services is a non-empty array
  if (!services || !Array.isArray(services) || services.length === 0 || !date || !time || !number) {
    return res.status(400).json({ message: 'All fields are required, including at least one service' });
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
      services, // Now an array
      date,
      time,
      number,
    });
    console.log('Saving new appointment:', newAppointment);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('POST /api/appointments error:', error.stack);
    // Removed duplicate check since `number` is no longer unique
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { services, date, time, number } = req.body; // Changed `service` to `services`
  console.log('PUT /api/appointments/:id request body:', req.body);

  // Validate input
  if (!services || !Array.isArray(services) || services.length === 0 || !date || !time || !number) {
    return res.status(400).json({ message: 'All fields are required, including at least one service' });
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { services, date, time, number }, // Update with new fields
      { new: true } // Return the updated document
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    console.log('Updated appointment:', updatedAppointment);
    res.json(updatedAppointment);
  } catch (error) {
    console.error('PUT /api/appointments/:id error:', error.stack);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    console.log('Deleted appointment:', appointment);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/appointments/:id error:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;