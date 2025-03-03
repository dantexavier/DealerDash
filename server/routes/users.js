const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');


// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'salesperson'
    });

    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    // Only admin can get all users
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Filter by role if provided
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', auth, async (req, res) => {
  try {
    // Only admin can get user details
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    // Only admin or the user themselves can update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // If not admin and trying to change role
    if (req.user.role !== 'admin' && req.body.role) {
      return res.status(403).json({ msg: 'Not authorized to change role' });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    await user.remove();
    
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;