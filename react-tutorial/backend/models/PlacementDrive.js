const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: String,
  date: Date,
  time: String,
  endTime: String,
  driveType: {
    type: String,
    enum: ['On-Campus', 'Virtual', 'Hybrid'],
    default: 'On-Campus'
  },
  mode: {
    type: String,
    enum: ['Online', 'In-Person'],
    default: 'In-Person'
  },
  roles: [String],
  package: String,
  eligibility: {
    minCGPA: Number,
    branches: [String],
    year: [String]
  },
  registrationDeadline: Date,
  registeredStudents: {
    type: Number,
    default: 0
  },
  shortlistedStudents: {
    type: Number,
    default: 0
  },
  selectedStudents: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  venue: String,
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
