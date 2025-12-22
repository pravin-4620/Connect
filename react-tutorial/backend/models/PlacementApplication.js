const mongoose = require('mongoose');

const placementApplicationSchema = new mongoose.Schema({
  placement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Placement',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: String,
  role: String,
  applicationStatus: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected', 'Pending'],
    default: 'Applied'
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
  applicationReason: String,
  resume: String, // File path or URL
  appliedAt: {
    type: Date,
    default: Date.now
  },
  interviewSchedule: {
    round: String,
    date: Date,
    time: String,
    location: String,
    mode: String
  },
  result: {
    status: String,
    feedback: String,
    resultDate: Date
  }
});

module.exports = mongoose.model('PlacementApplication', placementApplicationSchema);
