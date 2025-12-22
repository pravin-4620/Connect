const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['placement', 'event', 'other'],
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
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  placementApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementApplication'
  },
  eventRegistration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventRegistration'
  },
  title: String,
  description: String,
  reason: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approverComments: String,
  approvedAt: Date,
  requestedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    company: String,
    role: String,
    eventName: String,
    package: String
  }
});

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
