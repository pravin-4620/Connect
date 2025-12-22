const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please add a valid URL'
    ]
  },
  industry: {
    type: String,
    required: [true, 'Please add an industry']
  },
  logo: {
    type: String // URL to logo image
  },
  location: {
    type: String
  },
  employeeCount: {
    type: String,
    enum: ['1-50', '51-200', '201-500', '501-1000', '1000+']
  },
  email: {
    type: String,
    trim: true
  },
  phone: String,
  contactPerson: String,
  designation: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  totalOffersCount: {
    type: Number,
    default: 0
  },
  hiringRoles: [String],
  previouslyVisited: Boolean,
  yearsOfAssociation: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', companySchema);
