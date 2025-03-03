const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Labor = require('../models/Labor');

// @route   GET api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/vehicles
// @desc    Create a vehicle
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newVehicle = new Vehicle({
      ...req.body
    });

    const vehicle = await newVehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/vehicles/:id
// @desc    Update a vehicle
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    // Update vehicle
    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    // Also delete related labor entries
    await Labor.deleteMany({ vehicle: req.params.id });
    
    // Delete vehicle
    await vehicle.remove();
    
    res.json({ msg: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;