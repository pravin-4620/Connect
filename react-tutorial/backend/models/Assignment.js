const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  dueDate: Date,
  submissionDeadline: Date,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'submitted', 'graded'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  points: Number,
  instructions: String,
  attachments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
