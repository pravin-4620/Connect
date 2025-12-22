const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');

// ============ COMPANY ROUTES ============

// @route   GET /api/companies
// @desc    Get all companies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status;

    const companies = await Company.find(query);

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/companies
// @desc    Create new company (Placement Officer)
// @access  Private/Placement Officer
router.post('/', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const company = await Company.create(req.body);

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('company-created', company);
    io.to('student').emit('company-created', company);

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company (Placement Officer)
// @access  Private/Placement Officer
router.put('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company (Placement Officer)
// @access  Private/Placement Officer
router.delete('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('company-deleted', { companyId: req.params.id });
    io.to('student').emit('company-deleted', { companyId: req.params.id });

    res.status(200).json({ success: true, message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PLACEMENT DRIVE ROUTES ============

// @route   GET /api/drives
// @desc    Get all placement drives
// @access  Public
router.get('/drives', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status;

    const drives = await PlacementDrive.find(query)
      .populate('company', 'name industry location')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/drives/:id
// @desc    Get single drive
// @access  Public
router.get('/drives/:id', async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('company', 'name industry location contact')
      .populate('createdBy', 'name email');

    if (!drive) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }

    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/drives
// @desc    Create new placement drive (Placement Officer)
// @access  Private/Placement Officer
router.post('/drives', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const drive = await PlacementDrive.create({
      ...req.body,
      createdBy: req.user.id
    });

    await drive.populate('company', 'name industry location');

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('drive-created', drive);
    io.to('student').emit('drive-created', drive);

    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/drives/:id
// @desc    Update drive (Placement Officer)
// @access  Private/Placement Officer
router.put('/drives/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('company', 'name industry location');

    if (!drive) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }

    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/drives/:id
// @desc    Delete drive (Placement Officer)
// @access  Private/Placement Officer
router.delete('/drives/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return res.status(404).json({ success: false, error: 'Drive not found' });
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('drive-deleted', { driveId: req.params.id });
    io.to('student').emit('drive-deleted', { driveId: req.params.id });

    res.status(200).json({ success: true, message: 'Drive deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
