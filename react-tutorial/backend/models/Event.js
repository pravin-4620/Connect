const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['Workshop', 'Competition', 'Seminar', 'Hackathon', 'Career Fair', 'Webinar', 'Other'],
    required: true
  },
  date: Date,
  time: String,
  endTime: String,
  venue: {
    type: String,
    trim: true
  },
  location: String,
  mode: {
    type: String,
    enum: ['In-Person', 'Virtual', 'Hybrid'],
    default: 'In-Person'
  },
  description: String,
  registrationDeadline: Date,
  maxParticipants: Number,
  registeredCount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Academic', 'Career', 'Technical', 'Cultural', 'Sports', 'Other'],
    default: 'Other'
  },
  organizer: String,
  contact: {
    email: String,
    phone: String
  },
  posterUrl: String,
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  requiresMentorApproval: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
