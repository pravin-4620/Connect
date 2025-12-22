const mongoose = require('mongoose');

const mentorAssignmentSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed'],
    default: 'Active'
  },
  department: String,
  academicYear: String,
  focusAreas: [String],
  notes: String
});

// Compound index to prevent duplicate assignments
mentorAssignmentSchema.index({ mentor: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('MentorAssignment', mentorAssignmentSchema);
