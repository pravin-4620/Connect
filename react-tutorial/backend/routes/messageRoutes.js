const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const MentorAssignment = require('../models/MentorAssignment');

// @route   GET /api/messages/contacts
// @desc    Get list of contacts the user can message
// @access  Private
router.get('/contacts', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let contacts = [];

    if (userRole === 'student') {
      // Students can message their assigned mentor and placement officers
      const assignment = await MentorAssignment.findOne({ user: userId })
        .populate('mentor', 'name email photo department role');
      
      if (assignment && assignment.mentor) {
        contacts.push({
          ...assignment.mentor._doc,
          relationship: 'Mentor'
        });
      }

      // Add all placement officers
      const officers = await User.find({ role: 'placement_officer' })
        .select('name email photo department role');
      officers.forEach(officer => {
        contacts.push({
          ...officer._doc,
          relationship: 'Placement Officer'
        });
      });

    } else if (userRole === 'mentor') {
      // Mentors can message their assigned students and placement officers
      const assignments = await MentorAssignment.find({ mentor: userId })
        .populate('user', 'name email photo department role');
      
      assignments.forEach(assignment => {
        if (assignment.user) {
          contacts.push({
            ...assignment.user._doc,
            relationship: 'Student'
          });
        }
      });

      // Add placement officers
      const officers = await User.find({ role: 'placement_officer' })
        .select('name email photo department role');
      officers.forEach(officer => {
        contacts.push({
          ...officer._doc,
          relationship: 'Placement Officer'
        });
      });

    } else if (userRole === 'placement_officer') {
      // Placement officers can message all students and mentors
      const students = await User.find({ role: 'student' })
        .select('name email photo department role');
      students.forEach(student => {
        contacts.push({
          ...student._doc,
          relationship: 'Student'
        });
      });

      const mentors = await User.find({ role: 'mentor' })
        .select('name email photo department role');
      mentors.forEach(mentor => {
        contacts.push({
          ...mentor._doc,
          relationship: 'Mentor'
        });
      });
    }

    // Get unread counts for each contact
    for (let contact of contacts) {
      const unreadCount = await Message.countDocuments({
        sender: contact._id,
        receiver: userId,
        read: false
      });
      contact.unreadCount = unreadCount;
    }

    // Get last message for each contact
    for (let contact of contacts) {
      const conversationId = Message.getConversationId(userId, contact._id);
      const lastMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 })
        .select('content createdAt sender');
      contact.lastMessage = lastMessage;
    }

    // Sort by last message time
    contacts.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || new Date(0);
      const timeB = b.lastMessage?.createdAt || new Date(0);
      return new Date(timeB) - new Date(timeA);
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation with a specific user
// @access  Private
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = Message.getConversationId(currentUserId, otherUserId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name photo')
      .populate('receiver', 'name photo');

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Get the other user's info
    const otherUser = await User.findById(otherUserId)
      .select('name email photo role department');

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        user: otherUser,
        conversationId
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/messages/send
// @desc    Send a message
// @access  Private
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', fileUrl } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Receiver and content are required'
      });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Receiver not found'
      });
    }

    const conversationId = Message.getConversationId(req.user.id, receiverId);

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      messageType,
      fileUrl,
      conversationId
    });

    await message.populate('sender', 'name photo');
    await message.populate('receiver', 'name photo');

    // Emit WebSocket event for real-time delivery
    const io = req.app.get('io');
    
    // Send to the specific receiver's room
    io.to(`user_${receiverId}`).emit('new-message', {
      message: message,
      conversationId
    });

    // Also send to sender for confirmation
    io.to(`user_${req.user.id}`).emit('message-sent', {
      message: message,
      conversationId
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/messages/read/:conversationId
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/read/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user.id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Emit read receipt
    const io = req.app.get('io');
    io.to(`conversation_${conversationId}`).emit('messages-read', {
      conversationId,
      readBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message (only sender can delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
