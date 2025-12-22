const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Helper function to send interview notification
const sendInterviewNotification = async (interview, student, type = 'scheduled') => {
  try {
    const studentUser = await User.findById(student.user);
    if (!studentUser || !studentUser.email) return;

    let subject, html;
    const interviewDate = new Date(interview.scheduledDate).toLocaleDateString();
    
    if (type === 'scheduled') {
      subject = `Interview Scheduled: ${interview.company} - ${interview.role}`;
      html = `
        <h2>Interview Scheduled</h2>
        <p>Dear ${student.name},</p>
        <p>Your interview has been scheduled with the following details:</p>
        <ul>
          <li><strong>Company:</strong> ${interview.company}</li>
          <li><strong>Role:</strong> ${interview.role}</li>
          <li><strong>Date:</strong> ${interviewDate}</li>
          <li><strong>Time:</strong> ${interview.scheduledTime}</li>
          <li><strong>Duration:</strong> ${interview.duration} minutes</li>
          <li><strong>Type:</strong> ${interview.interviewType}</li>
          <li><strong>Mode:</strong> ${interview.mode}</li>
          ${interview.mode === 'In-Person' ? `<li><strong>Venue:</strong> ${interview.venue}</li>` : ''}
          ${interview.mode === 'Virtual' ? `<li><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></li>` : ''}
        </ul>
        ${interview.instructions ? `<p><strong>Instructions:</strong> ${interview.instructions}</p>` : ''}
        <p>Best of luck!</p>
      `;
    } else if (type === 'reminder') {
      subject = `Reminder: Interview Tomorrow - ${interview.company}`;
      html = `
        <h2>Interview Reminder</h2>
        <p>Dear ${student.name},</p>
        <p>This is a reminder that you have an interview scheduled for tomorrow:</p>
        <ul>
          <li><strong>Company:</strong> ${interview.company}</li>
          <li><strong>Role:</strong> ${interview.role}</li>
          <li><strong>Time:</strong> ${interview.scheduledTime}</li>
          <li><strong>Mode:</strong> ${interview.mode}</li>
        </ul>
        <p>Please be prepared and on time. Good luck!</p>
      `;
    } else if (type === 'result') {
      subject = `Interview Result: ${interview.company} - ${interview.result}`;
      html = `
        <h2>Interview Result</h2>
        <p>Dear ${student.name},</p>
        <p>Your interview result for ${interview.company} (${interview.role}) is: <strong>${interview.result}</strong></p>
        ${interview.feedback?.comments ? `<p><strong>Feedback:</strong> ${interview.feedback.comments}</p>` : ''}
        <p>Thank you for your participation.</p>
      `;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'placement@college.edu',
      to: studentUser.email,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// @route   POST /api/interviews
// @desc    Schedule a new interview
// @access  Private (Placement Officer, Mentor)
router.post('/', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const {
      student,
      placement,
      company,
      role,
      scheduledDate,
      scheduledTime,
      duration,
      interviewType,
      mode,
      venue,
      meetingLink,
      interviewers,
      round,
      instructions,
      documents
    } = req.body;

    // Check if student exists
    const studentDoc = await Student.findById(student);
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for conflicting interviews
    const existingInterview = await Interview.findOne({
      student,
      scheduledDate,
      scheduledTime,
      status: { $in: ['Scheduled', 'Confirmed'] }
    });

    if (existingInterview) {
      return res.status(400).json({ 
        message: 'Student already has an interview scheduled at this time' 
      });
    }

    const interview = new Interview({
      student,
      placement,
      company,
      role,
      scheduledDate,
      scheduledTime,
      duration: duration || 60,
      interviewType: interviewType || 'Technical',
      mode: mode || 'Virtual',
      venue,
      meetingLink,
      interviewers: interviewers || [],
      round: round || 1,
      instructions,
      documents: documents || [],
      scheduledBy: req.user._id
    });

    await interview.save();

    // Send notification to student
    await sendInterviewNotification(interview, studentDoc, 'scheduled');

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/interviews
// @desc    Get all interviews with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      student,
      company,
      status,
      interviewType,
      mode,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (studentDoc) {
        query.student = studentDoc._id;
      }
    } else {
      if (student) query.student = student;
    }

    if (company) query.company = { $regex: company, $options: 'i' };
    if (status) query.status = status;
    if (interviewType) query.interviewType = interviewType;
    if (mode) query.mode = mode;

    if (fromDate || toDate) {
      query.scheduledDate = {};
      if (fromDate) query.scheduledDate.$gte = new Date(fromDate);
      if (toDate) query.scheduledDate.$lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const interviews = await Interview.find(query)
      .populate('student', 'name email phone department')
      .populate('placement', 'title company')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/interviews/upcoming
// @desc    Get upcoming interviews
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    let query = {
      scheduledDate: { $gte: new Date() },
      status: { $in: ['Scheduled', 'Confirmed'] }
    };

    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (studentDoc) {
        query.student = studentDoc._id;
      }
    }

    const interviews = await Interview.find(query)
      .populate('student', 'name email phone department')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(10);

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/interviews/today
// @desc    Get today's interviews
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = {
      scheduledDate: { $gte: today, $lt: tomorrow }
    };

    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (studentDoc) {
        query.student = studentDoc._id;
      }
    }

    const interviews = await Interview.find(query)
      .populate('student', 'name email phone department')
      .sort({ scheduledTime: 1 });

    res.json(interviews);
  } catch (error) {
    console.error('Error fetching today\'s interviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/interviews/:id
// @desc    Get interview by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('student', 'name email phone department cgpa skills')
      .populate('placement', 'title company description')
      .populate('scheduledBy', 'name email');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/interviews/:id
// @desc    Update interview details
// @access  Private (Placement Officer, Mentor)
router.put('/:id', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('student', 'name email phone department');

    // Notify student if date/time changed
    if (req.body.scheduledDate || req.body.scheduledTime) {
      const student = await Student.findById(interview.student);
      if (student) {
        await sendInterviewNotification(updatedInterview, student, 'scheduled');
      }
    }

    res.json({
      message: 'Interview updated successfully',
      interview: updatedInterview
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/interviews/:id/status
// @desc    Update interview status
// @access  Private (Placement Officer, Mentor)
router.put('/:id/status', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('student', 'name email phone department');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({
      message: 'Interview status updated',
      interview
    });
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/interviews/:id/result
// @desc    Record interview result and feedback
// @access  Private (Placement Officer, Mentor)
router.put('/:id/result', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const { result, feedback } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.result = result;
    interview.feedback = feedback;
    interview.status = 'Completed';
    await interview.save();

    // Notify student of result
    const student = await Student.findById(interview.student);
    if (student) {
      await sendInterviewNotification(interview, student, 'result');
    }

    res.json({
      message: 'Interview result recorded',
      interview
    });
  } catch (error) {
    console.error('Error recording interview result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/interviews/:id/confirm
// @desc    Student confirms interview attendance
// @access  Private (Student)
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Verify student owns this interview
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc || interview.student.toString() !== studentDoc._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    interview.status = 'Confirmed';
    await interview.save();

    res.json({
      message: 'Interview confirmed',
      interview
    });
  } catch (error) {
    console.error('Error confirming interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/interviews/:id
// @desc    Cancel/Delete an interview
// @access  Private (Placement Officer, Mentor)
router.delete('/:id', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Instead of deleting, mark as cancelled
    interview.status = 'Cancelled';
    await interview.save();

    res.json({ message: 'Interview cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/interviews/send-reminders
// @desc    Send reminders for tomorrow's interviews
// @access  Private (Placement Officer, Admin)
router.post('/send-reminders', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const interviews = await Interview.find({
      scheduledDate: { $gte: tomorrow, $lt: dayAfter },
      status: { $in: ['Scheduled', 'Confirmed'] },
      reminderSent: false
    }).populate('student');

    let sentCount = 0;
    for (const interview of interviews) {
      const student = await Student.findById(interview.student);
      if (student) {
        await sendInterviewNotification(interview, student, 'reminder');
        interview.reminderSent = true;
        await interview.save();
        sentCount++;
      }
    }

    res.json({
      message: `Reminders sent to ${sentCount} students`,
      count: sentCount
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/interviews/stats/summary
// @desc    Get interview statistics
// @access  Private (Placement Officer, Admin)
router.get('/stats/summary', auth, authorize('placement_officer', 'admin', 'mentor'), async (req, res) => {
  try {
    const stats = await Interview.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const resultStats = await Interview.aggregate([
      { $match: { result: { $ne: null } } },
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Interview.aggregate([
      {
        $group: {
          _id: '$interviewType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      resultStats,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching interview stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
