const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ApprovalRequest = require('../models/ApprovalRequest');
const PlacementApplication = require('../models/PlacementApplication');
const EventRegistration = require('../models/EventRegistration');
const Student = require('../models/Student');
const MentorAssignment = require('../models/MentorAssignment');

// @route   GET /api/approvals
// @desc    Get approval requests (Mentor can see approvals for their assigned students, or all if unassigned)
// @access  Private/Mentor
router.get('/', protect, authorize('mentor'), async (req, res) => {
  try {
    const { status } = req.query;
    
    // Find students assigned to this mentor
    const assignments = await MentorAssignment.find({ mentor: req.user.id });
    const assignedStudentIds = assignments.map(a => a.student);

    let query = {};
    
    // If mentor has assigned students, show only their approvals
    // Otherwise show all pending approvals (for easy testing)
    if (assignedStudentIds.length > 0) {
      query.student = { $in: assignedStudentIds };
    }
    
    if (status) {
      query.status = status;
    } else {
      // Default to showing pending approvals
      query.status = 'Pending';
    }

    const approvals = await ApprovalRequest.find(query)
      .populate('user', 'name email')
      .populate('student', 'name email')
      .sort('-requestedAt');

    res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/approvals/pending
// @desc    Get pending approvals for a mentor
// @access  Private/Mentor
router.get('/pending', protect, authorize('mentor'), async (req, res) => {
  try {
    // Find students assigned to this mentor
    const assignments = await MentorAssignment.find({ mentor: req.user.id });
    const assignedStudentIds = assignments.map(a => a.student);

    let query = { status: 'Pending' };
    
    // If mentor has assigned students, show only their approvals
    if (assignedStudentIds.length > 0) {
      query.student = { $in: assignedStudentIds };
    }

    const approvals = await ApprovalRequest.find(query)
      .populate('user', 'name email')
      .populate('student', 'name email')
      .sort('-requestedAt');

    res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/approvals/:id
// @desc    Get specific approval request
// @access  Private/Mentor
router.get('/:id', protect, authorize('mentor'), async (req, res) => {
  try {
    const approval = await ApprovalRequest.findById(req.params.id)
      .populate('user', 'name email')
      .populate('student', 'name email')
      .populate('placementApplication')
      .populate('eventRegistration');

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }

    res.status(200).json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/approvals/:id/approve
// @desc    Approve a request
// @access  Private/Mentor
router.put('/:id/approve', protect, authorize('mentor'), async (req, res) => {
  try {
    const { comments } = req.body;
    const approval = await ApprovalRequest.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }

    approval.status = 'Approved';
    approval.approverComments = comments;
    approval.approvedAt = Date.now();
    await approval.save();

    // Update related application/registration
    if (approval.requestType === 'placement' && approval.placementApplication) {
      await PlacementApplication.findByIdAndUpdate(
        approval.placementApplication,
        {
          'mentorApproval.status': 'Approved',
          'mentorApproval.approvedBy': req.user.id,
          'mentorApproval.approvalDate': Date.now()
        }
      );
    } else if (approval.requestType === 'event' && approval.eventRegistration) {
      await EventRegistration.findByIdAndUpdate(
        approval.eventRegistration,
        {
          'mentorApproval.status': 'Approved',
          'mentorApproval.approvedBy': req.user.id,
          'mentorApproval.approvalDate': Date.now()
        }
      );
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('mentor').emit('approval-updated', {
      approvalId: approval._id,
      status: 'Approved',
      mentor: req.user.id
    });
    io.to('student').emit('approval-updated', {
      approvalId: approval._id,
      status: 'Approved'
    });

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: approval
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/approvals/:id/reject
// @desc    Reject a request
// @access  Private/Mentor
router.put('/:id/reject', protect, authorize('mentor'), async (req, res) => {
  try {
    const { comments } = req.body;
    const approval = await ApprovalRequest.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }

    approval.status = 'Rejected';
    approval.approverComments = comments;
    approval.approvedAt = Date.now();
    await approval.save();

    // Update related application/registration
    if (approval.requestType === 'placement' && approval.placementApplication) {
      await PlacementApplication.findByIdAndUpdate(
        approval.placementApplication,
        {
          'mentorApproval.status': 'Rejected',
          'mentorApproval.approvalReason': comments
        }
      );
    } else if (approval.requestType === 'event' && approval.eventRegistration) {
      await EventRegistration.findByIdAndUpdate(
        approval.eventRegistration,
        {
          'mentorApproval.status': 'Rejected',
          'mentorApproval.approvalReason': comments
        }
      );
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('mentor').emit('approval-updated', {
      approvalId: approval._id,
      status: 'Rejected',
      mentor: req.user.id
    });
    io.to('student').emit('approval-updated', {
      approvalId: approval._id,
      status: 'Rejected'
    });

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: approval
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
