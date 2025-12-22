const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const MentorAssignment = require('../models/MentorAssignment');
const Student = require('../models/Student');
const User = require('../models/User');

// @route   POST /api/mentor-assignments
// @desc    Assign a mentor to a student (Placement Officer)
// @access  Private/Placement Officer
router.post('/', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;

    // Verify mentor exists and has correct role
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ success: false, error: 'Invalid mentor' });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(400).json({ success: false, error: 'Invalid student' });
    }

    // Check if assignment already exists
    const existing = await MentorAssignment.findOne({
      mentor: mentorId,
      student: studentId
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Assignment already exists' });
    }

    const assignment = await MentorAssignment.create({
      mentor: mentorId,
      student: studentId,
      user: student.user,
      status: 'Active'
    });

    await assignment.populate('mentor', 'name email');
    await assignment.populate('student', 'name');

    res.status(201).json({
      success: true,
      message: 'Mentor assigned successfully',
      data: assignment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   GET /api/mentor-assignments/my-students
// @desc    Get students assigned to me (Mentor)
// @access  Private/Mentor
router.get('/my-students', protect, authorize('mentor'), async (req, res) => {
  try {
    const assignments = await MentorAssignment.find({
      mentor: req.user.id,
      status: 'Active'
    })
      .populate('student', 'name email gpa')
      .populate('user', 'name email');

    const students = assignments.map(a => ({
      ...a.student._doc,
      assignmentId: a._id
    }));

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/mentor-assignments/mentors
// @desc    List all mentors (Placement Officer)
// @access  Private/Placement Officer
router.get('/mentors', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('name email department photo');
    res.status(200).json({ success: true, count: mentors.length, data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/mentor-assignments/:studentId
// @desc    Get mentor for a student
// @access  Private
router.get('/:studentId', protect, async (req, res) => {
  try {
    const assignment = await MentorAssignment.findOne({
      student: req.params.studentId,
      status: 'Active'
    })
      .populate('mentor', 'name email');

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'No active mentor assignment found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/mentor-assignments/:id
// @desc    Update mentor assignment
// @access  Private/Placement Officer
router.put('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const assignment = await MentorAssignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('mentor', 'name email')
      .populate('student', 'name');

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/mentor-assignments/:id
// @desc    Remove mentor assignment
// @access  Private/Placement Officer
router.delete('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const assignment = await MentorAssignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.status(200).json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
