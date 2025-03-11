const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/authMiddleware');

// Add a vehicle (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, manufacturer, number } = req.body;
    console.log('Adding vehicle for user:', req.user.id);
    console.log('Vehicle data:', { name, manufacturer, number });
    
    const vehicle = new Vehicle({
      userId: req.user.id, // From authMiddleware
      name,
      manufacturer,
      number,
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Vehicle add error details:', error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's vehicles (protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching vehicles for user:', req.user.id);
    const vehicles = await Vehicle.find({ userId: req.user.id });
    console.log('Found vehicles:', vehicles.length);
    res.json(vehicles);
  } catch (error) {
    console.error('Vehicle fetch error details:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;