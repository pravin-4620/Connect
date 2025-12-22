const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  placement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Placement',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  duration: {
    type: Number,
    default: 60 // minutes
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'HR', 'Managerial', 'Group Discussion', 'Aptitude', 'Final'],
    default: 'Technical'
  },
  mode: {
    type: String,
    enum: ['In-Person', 'Virtual', 'Phone'],
    default: 'In-Person'
  },
  venue: {
    type: String
  },
  meetingLink: {
    type: String
  },
  interviewers: [{
    name: String,
    designation: String,
    email: String
  }],
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
    default: 'Scheduled'
  },
  result: {
    type: String,
    enum: ['Pending', 'Selected', 'Rejected', 'On Hold', 'Next Round'],
    default: 'Pending'
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    technicalSkills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
    cultureFit: { type: Number, min: 1, max: 5 },
    comments: String,
    strengths: [String],
    improvements: [String]
  },
  round: {
    type: Number,
    default: 1
  },
  instructions: {
    type: String
  },
  documents: [{
    name: String,
    url: String
  }],
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying
interviewSchema.index({ student: 1, scheduledDate: 1 });
interviewSchema.index({ company: 1, scheduledDate: 1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
