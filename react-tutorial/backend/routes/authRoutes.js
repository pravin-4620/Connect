const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    // If the user is a student, also create a Student profile record
    if ((role || 'student') === 'student') {
      await Student.create({
        user: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: `STU-${Date.now()}`,
        department: '',
        year: '',
        cgpa: 0,
        skills: [],
        resume: '',
        phone: '',
        address: '',
        linkedin: '',
        github: ''
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted || false,
        photo: user.photo || '',
        phone: user.phone || '',
        department: user.department || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted || false,
        photo: user.photo || '',
        phone: user.phone || '',
        department: user.department || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (photo, phone, department)
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { photo, phone, department, profileCompleted } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        photo: photo || '',
        phone: phone || '',
        department: department || '',
        profileCompleted: profileCompleted !== undefined ? profileCompleted : false
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        photo: user.photo,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
