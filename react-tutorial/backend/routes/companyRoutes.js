const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/companies
// @desc    Create a new company
// @access  Private (Placement Officer)
router.post('/', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private (Placement Officer)
router.put('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Private (Placement Officer)
router.delete('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
