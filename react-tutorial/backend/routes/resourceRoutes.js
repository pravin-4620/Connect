const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const StudyResource = require('../models/StudyResource');

// ============ ASSIGNMENT ROUTES ============

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { course, status } = req.query;
    let query = {};

    if (course) query.course = course;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email')
      .sort('-dueDate');

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ STUDY RESOURCE ROUTES ============
// NOTE: These must come BEFORE /:id to avoid route conflicts

// @route   GET /api/assignments/resources
// @desc    Get all approved resources
// @access  Public
router.get('/resources', async (req, res) => {
  try {
    const { subject, resourceType } = req.query;
    let query = { isApproved: true };

    if (subject) query.subject = subject;
    if (resourceType) query.resourceType = resourceType;

    const resources = await StudyResource.find(query)
      .populate('uploadedBy', 'name email')
      .sort('-uploadedAt');

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/assignments/resources
// @desc    Upload new resource
// @access  Private/Student/Mentor
router.post('/resources', protect, authorize('student', 'mentor'), async (req, res) => {
  try {
    const resource = await StudyResource.create({
      ...req.body,
      uploadedBy: req.user.id,
      isApproved: req.user.role === 'mentor' // Auto-approve for mentors
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   GET /api/assignments/resources/:id
// @desc    Get single resource
// @access  Public
router.get('/resources/:id', async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/assignments/resources/:id/approve
// @desc    Approve resource (Admin)
// @access  Private/Placement Officer
router.put('/resources/:id/approve', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const resource = await StudyResource.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.user.id
      },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/assignments/resources/:id/rate
// @desc    Rate a resource
// @access  Private
router.put('/resources/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 0 and 5' });
    }

    const resource = await StudyResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Update rating
    const totalRatings = resource.totalRatings + 1;
    const newRating = (resource.rating * resource.totalRatings + rating) / totalRatings;

    resource.rating = newRating;
    resource.totalRatings = totalRatings;
    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted',
      data: resource
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/assignments/resources/:id
// @desc    Delete resource
// @access  Private/Creator
router.delete('/resources/:id', protect, async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'placement_officer') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await StudyResource.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ASSIGNMENT SPECIFIC ROUTES ============
// NOTE: These must come AFTER /resources routes

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment (Faculty/Mentor)
// @access  Private/Mentor
router.post('/', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private/Creator
router.put('/:id', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private/Creator
router.delete('/:id', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
