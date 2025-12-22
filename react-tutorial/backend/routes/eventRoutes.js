const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Student = require('../models/Student');
const ApprovalRequest = require('../models/ApprovalRequest');

// ============ EVENT ROUTES ============

// @route   GET /api/events
// @desc    Get all active events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { eventType, status } = req.query;
    let query = {};

    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/events
// @desc    Create new event (Mentor/Placement Officer)
// @access  Private
router.post('/', protect, authorize('placement_officer', 'mentor'), async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('event-created', event);
    io.to('mentor').emit('event-created', event);
    io.to('student').emit('event-created', event);

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (Mentor/Placement Officer)
// @access  Private
router.put('/:id', protect, authorize('placement_officer', 'mentor'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('event-updated', event);
    io.to('mentor').emit('event-updated', event);
    io.to('student').emit('event-updated', event);

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Mentor/Placement Officer)
// @access  Private
router.delete('/:id', protect, authorize('placement_officer', 'mentor'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Emit WebSocket event for real-time sync
    const io = req.app.get('io');
    io.to('placement_officer').emit('event-deleted', { eventId: req.params.id });
    io.to('mentor').emit('event-deleted', { eventId: req.params.id });
    io.to('student').emit('event-deleted', { eventId: req.params.id });

    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ EVENT REGISTRATION ROUTES ============

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private/Student
router.post('/:id/register', protect, authorize('student'), async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      event: req.params.id,
      user: req.user.id
    });

    if (existingRegistration) {
      return res.status(400).json({ success: false, error: 'You are already registered for this event' });
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

    const registration = await EventRegistration.create({
      event: req.params.id,
      student: student._id,
      user: req.user.id,
      eventTitle: event.title,
      registrationReason: reason,
      mentorApproval: {
        status: event.requiresMentorApproval ? 'Pending' : 'Approved'
      }
    });

    // Update event registration count
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { registeredCount: 1 }
    });

    // Create approval request if needed
    if (event.requiresMentorApproval) {
      await ApprovalRequest.create({
        requestType: 'event',
        student: student._id,
        user: req.user.id,
        eventRegistration: registration._id,
        title: `Event Registration: ${event.title}`,
        description: reason,
        reason: reason,
        metadata: {
          eventName: event.title
        }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: event.requiresMentorApproval ? 'Registered successfully. Awaiting mentor approval.' : 'Registered successfully!',
      data: registration 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   GET /api/events/:id/registrations
// @desc    Get event registrations (Admin/Organizer)
// @access  Private
router.get('/:id/registrations', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ event: req.params.id })
      .populate('user', 'name email')
      .populate('student', 'user');

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/registrations/my
// @desc    Get my event registrations (Student)
// @access  Private/Student
router.get('/registrations/my', protect, authorize('student'), async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user.id })
      .populate('event', 'title date eventType venue')
      .sort('-registeredAt');

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/events/:id/unregister
// @desc    Unregister from event
// @access  Private/Student
router.delete('/:id/unregister', protect, authorize('student'), async (req, res) => {
  try {
    const registration = await EventRegistration.findOneAndDelete({
      event: req.params.id,
      user: req.user.id
    });

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    // Update event registration count
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { registeredCount: -1 }
    });

    res.status(200).json({ success: true, message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
