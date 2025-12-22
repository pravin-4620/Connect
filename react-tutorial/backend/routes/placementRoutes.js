const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Placement = require('../models/Placement');
const PlacementApplication = require('../models/PlacementApplication');
const Student = require('../models/Student');
const ApprovalRequest = require('../models/ApprovalRequest');

// ============ PLACEMENT ROUTES ============

// @route   GET /api/placements
// @desc    Get all active placements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const placements = await Placement.find({ status: 'Open' })
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: placements.length,
      data: placements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PLACEMENT APPLICATION ROUTES (placed before /:id to avoid conflicts) ============

// @route   GET /api/placements/applications/my
// @desc    Get my placement applications (Student)
// @access  Private/Student
router.get('/applications/my', protect, authorize('student'), async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user.id });

    // If no student record exists, create one
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      student = await Student.create({
        user: req.user.id,
        name: user.name,
        email: user.email,
        registrationNumber: `STU-${Date.now()}`,
        department: user.department || '',
        year: '',
        cgpa: 0,
        skills: [],
        resume: '',
        phone: user.phone || '',
        address: '',
        linkedin: '',
        github: ''
      });
    }

    const applications = await PlacementApplication.find({ student: student._id })
      .populate('placement', 'company role package jobType applicationDeadline')
      .sort('-appliedAt');

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/placements/applications
// @desc    Get all placement applications (Mentor/Placement Officer)
// @access  Private/Mentor/Placement Officer
router.get('/applications', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const applications = await PlacementApplication.find()
      .populate('student', 'name email')
      .populate('placement', 'company role package')
      .populate('user', 'name email')
      .sort('-appliedAt');

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/placements/:id
// @desc    Get single placement by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!placement) {
      return res.status(404).json({ success: false, error: 'Placement not found' });
    }

    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/placements
// @desc    Create new placement (Placement Officer only)
// @access  Private/Placement Officer
router.post('/', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const placement = await Placement.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('placement-created', placement);
    io.to('student').emit('placement-created', placement);

    res.status(201).json({ success: true, data: placement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/placements/:id
// @desc    Update placement (Placement Officer only)
// @access  Private/Placement Officer
router.put('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!placement) {
      return res.status(404).json({ success: false, error: 'Placement not found' });
    }

    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/placements/:id
// @desc    Delete placement (Placement Officer only)
// @access  Private/Placement Officer
router.delete('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.id);

    if (!placement) {
      return res.status(404).json({ success: false, error: 'Placement not found' });
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('placement-deleted', { placementId: req.params.id });
    io.to('student').emit('placement-deleted', { placementId: req.params.id });

    res.status(200).json({ success: true, message: 'Placement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PLACEMENT APPLICATION ROUTES ============

// @route   POST /api/placements/:id/apply
// @desc    Student applies for a placement
// @access  Private/Student
router.post('/:id/apply', protect, authorize('student'), async (req, res) => {
  try {
    const { reason } = req.body;
    const placement = await Placement.findById(req.params.id);

    if (!placement) {
      return res.status(404).json({ success: false, error: 'Placement not found' });
    }

    // Check if already applied
    const existingApplication = await PlacementApplication.findOne({
      placement: req.params.id,
      user: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ success: false, error: 'You have already applied for this placement' });
    }

    // Find or create student record
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      student = await Student.create({
        user: req.user.id,
        name: user.name,
        email: user.email,
        registrationNumber: `STU-${Date.now()}`,
        department: user.department || '',
        year: '',
        cgpa: 0,
        skills: [],
        resume: '',
        phone: user.phone || '',
        address: '',
        linkedin: '',
        github: ''
      });
    }

    const application = await PlacementApplication.create({
      placement: req.params.id,
      student: student._id,
      user: req.user.id,
      company: placement.company,
      role: placement.role,
      applicationReason: reason,
      mentorApproval: {
        status: 'Pending'
      }
    });

    // Create approval request
    await ApprovalRequest.create({
      requestType: 'placement',
      student: student._id,
      user: req.user.id,
      placementApplication: application._id,
      title: `Placement Application: ${placement.company} - ${placement.role}`,
      description: reason,
      reason: reason,
      metadata: {
        company: placement.company,
        role: placement.role,
        package: placement.package
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully. Awaiting mentor approval.',
      data: application 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;