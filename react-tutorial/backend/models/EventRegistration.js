const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventTitle: String,
  registrationStatus: {
    type: String,
    enum: ['Registered', 'Attended', 'Completed', 'Cancelled'],
    default: 'Registered'
  },
  mentorApproval: {
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalReason: String,
    approvalDate: Date
  },
  registrationReason: String,
  registeredAt: {
    type: Date,
    default: Date.now
  },
  attendanceMarked: Boolean,
  certificate: String, // File path or URL
  feedback: {
    rating: Number,
    comments: String,
    submittedAt: Date
  }
});

// Compound index to prevent duplicate registrations
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
