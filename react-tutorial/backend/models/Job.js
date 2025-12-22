const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  type: {
    type: String,
    enum: ['full-time', 'internship', 'part-time'],
    default: 'full-time'
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  requirements: {
    minimumCGPA: {
      type: Number,
      min: 0,
      max: 10
    },
    skills: [{
      type: String
    }],
    departments: [{
      type: String
    }],
    graduationYear: [Number]
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Please add an application deadline']
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'draft'],
    default: 'draft'
  },
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
