const mongoose = require('mongoose');

// Question Schema for reusable questions
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'True/False', 'Short Answer', 'Coding', 'Essay'],
    default: 'MCQ'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String
  },
  points: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  explanation: {
    type: String
  },
  category: {
    type: String
  },
  timeLimit: {
    type: Number, // in seconds
    default: 60
  }
});

// Skill Assessment Schema
const skillAssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  skillCategory: {
    type: String,
    enum: ['Technical', 'Aptitude', 'Communication', 'Logical Reasoning', 'Domain Knowledge', 'Coding', 'General'],
    required: true
  },
  skills: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 60 // percentage
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // minutes
  },
  instructions: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attempts: {
    type: Number,
    default: 1 // max attempts allowed
  },
  shuffleQuestions: {
    type: Boolean,
    default: true
  },
  showResults: {
    type: Boolean,
    default: true
  },
  requiredForPlacements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Placement'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
}, {
  timestamps: true
});

// Pre-save hook to calculate totals
skillAssessmentSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  next();
});

// Assessment Result Schema
const assessmentResultSchema = new mongoose.Schema({
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillAssessment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: Number,
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    selectedOptions: [Number],
    isCorrect: Boolean,
    pointsEarned: Number,
    timeTaken: Number // seconds
  }],
  score: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  timeTaken: {
    type: Number // total seconds
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Expired', 'Abandoned'],
    default: 'In Progress'
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  feedback: {
    type: String
  },
  certificate: {
    issued: Boolean,
    issuedAt: Date,
    certificateId: String
  },
  skillsVerified: [{
    skill: String,
    level: String, // Beginner, Intermediate, Advanced, Expert
    score: Number
  }]
}, {
  timestamps: true
});

// Index for efficient querying
assessmentResultSchema.index({ student: 1, assessment: 1 });
assessmentResultSchema.index({ student: 1, status: 1 });

const SkillAssessment = mongoose.model('SkillAssessment', skillAssessmentSchema);
const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

module.exports = { SkillAssessment, AssessmentResult };
