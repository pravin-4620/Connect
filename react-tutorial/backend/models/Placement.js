const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },
  package: {
    type: String,
    required: true
  },
  packageAmount: {
    type: Number,
    default: 0
  },
  packageCurrency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Contract', 'Part-time'],
    default: 'Full-time'
  },
  applicationDeadline: Date,
  status: {
    type: String,
    enum: ['Open', 'Closing Soon', 'Closed'],
    default: 'Open'
  },
  eligibility: {
    minCGPA: {
      type: Number,
      default: 6.0
    },
    branches: [String],
    year: [String],
    noBacklogs: Boolean
  },
  workLocation: String,
  mode: {
    type: String,
    enum: ['On-Campus', 'Virtual', 'Hybrid'],
    default: 'On-Campus'
  },
  totalPositions: {
    type: Number,
    default: 1
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

module.exports = mongoose.model('Placement', placementSchema);
