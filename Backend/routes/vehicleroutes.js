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
    console.log('Vehicle saved:', vehicle);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Vehicle add error details:', error.message, error.stack);
    // Removed duplicate check (error.code === 11000) since duplicates are allowed
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/vehicles/:id - Delete a vehicle by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    console.log('Deleted vehicle:', vehicle);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Vehicle delete error details:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;