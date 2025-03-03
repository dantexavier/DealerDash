const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Labor = require('../models/Labor');
const Vehicle = require('../models/Vehicle');

// @route   GET api/labor
// @desc    Get all labor entries
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const labor = await Labor.find()
      .populate('vehicle', 'vin stock make model year')
      .populate('mechanic', 'name')
      .sort({ date: -1 });
    res.json(labor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/labor/vehicle/:vehicleId
// @desc    Get labor entries for a specific vehicle
// @access  Private
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
  try {
    const labor = await Labor.find({ vehicle: req.params.vehicleId })
      .populate('mechanic', 'name')
      .sort({ date: -1 });
    res.json(labor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/labor
// @desc    Create a labor entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { vehicle: vehicleId, hours, cost, description } = req.body;
    
    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    const newLabor = new Labor({
      ...req.body,
      mechanic: req.user.id
    });
    
    const labor = await newLabor.save();
    
    // Update vehicle recon cost
    await Vehicle.findByIdAndUpdate(vehicleId, {
      $inc: { reconCost: cost }
    });
    
    res.json(labor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/labor/:id
// @desc    Get labor entry by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const labor = await Labor.findById(req.params.id);
    
    if (!labor) {
      return res.status(404).json({ msg: 'Labor entry not found' });
    }
    
    // Add these lines to populate related data
    await labor.populate('vehicle', 'vin stock make model year');
    await labor.populate('mechanic', 'name');
    
    res.json(labor);
  } catch (err) {
    console.error('Labor fetch error:', err.message);
    // Check if error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Labor entry not found - invalid ID format' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/labor/:id
// @desc    Update a labor entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let labor = await Labor.findById(req.params.id);
    
    if (!labor) {
      return res.status(404).json({ msg: 'Labor entry not found' });
    }
    
    // If cost is changing, update vehicle recon cost
    if (req.body.cost && req.body.cost !== labor.cost) {
      const costDifference = req.body.cost - labor.cost;
      await Vehicle.findByIdAndUpdate(labor.vehicle, {
        $inc: { reconCost: costDifference }
      });
    }
    
    // Update labor entry
    labor = await Labor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(labor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/labor/:id
// @desc    Delete a labor entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const labor = await Labor.findById(req.params.id);
    
    if (!labor) {
      return res.status(404).json({ msg: 'Labor entry not found' });
    }
    
    // Update vehicle recon cost
    await Vehicle.findByIdAndUpdate(labor.vehicle, {
      $inc: { reconCost: -labor.cost }
    });
    
    // Delete labor entry
    await labor.remove();
    
    res.json({ msg: 'Labor entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;