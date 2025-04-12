const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/authMiddleware');

// Add a vehicle (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, manufacturer, number } = req.body;

    // Validate required fields
    if (!name || !manufacturer || !number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const vehicle = new Vehicle({
      userId: req.user.id, // From authMiddleware
      name,
      manufacturer,
      number,
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    // Removed duplicate check (error.code === 11000) since duplicates are allowed
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's vehicles (protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/vehicles/:id - Delete a vehicle by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;