const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  year: {
    type: Number,
    required: [true, 'Please add year'],
    min: 1,
    max: 4
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please add a valid phone number']
  },
  address: {
    type: String
  },
  resume: {
    type: String // URL to resume file
  },
  certificates: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  skills: [{
    type: String
  }],
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
