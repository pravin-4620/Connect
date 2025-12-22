const mongoose = require('mongoose');

const studyResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  resourceType: {
    type: String,
    enum: ['Notes', 'Video', 'Tutorial', 'Paper', 'Book', 'Slides', 'Other'],
    default: 'Notes'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  tags: [String],
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudyResource', studyResourceSchema);
