const express = require('express');
const router = express.Router();
const { SkillAssessment, AssessmentResult } = require('../models/SkillAssessment');
const Student = require('../models/Student');
const { auth, authorize } = require('../middleware/auth');

// ==================== ASSESSMENT MANAGEMENT ====================

// @route   POST /api/assessments
// @desc    Create a new skill assessment
// @access  Private (Placement Officer, Mentor, Admin)
router.post('/', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      skillCategory,
      difficulty,
      questions,
      duration,
      passingScore,
      instructions,
      shuffleQuestions,
      showResults,
      attemptsAllowed,
      availableFrom,
      availableUntil,
      targetDepartments,
      targetBatches,
      prerequisites
    } = req.body;

    const assessment = new SkillAssessment({
      title,
      description,
      skillCategory,
      difficulty: difficulty || 'Intermediate',
      questions,
      duration: duration || 30,
      passingScore: passingScore || 60,
      instructions,
      shuffleQuestions: shuffleQuestions !== false,
      showResults: showResults !== false,
      attemptsAllowed: attemptsAllowed || 3,
      availableFrom,
      availableUntil,
      targetDepartments: targetDepartments || [],
      targetBatches: targetBatches || [],
      prerequisites: prerequisites || [],
      createdBy: req.user._id
    });

    await assessment.save();

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments
// @desc    Get all assessments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      skillCategory,
      difficulty,
      status,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    if (skillCategory) query.skillCategory = skillCategory;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // For students, only show active assessments
    if (req.user.role === 'student') {
      query.status = 'Active';
      query.$or = [
        { availableFrom: { $lte: new Date() } },
        { availableFrom: null }
      ];
      query.$or = [
        { availableUntil: { $gte: new Date() } },
        { availableUntil: null }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assessments = await SkillAssessment.find(query)
      .select('-questions.correctAnswer -questions.explanation')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SkillAssessment.countDocuments(query);

    res.json({
      assessments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/categories
// @desc    Get all skill categories
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await SkillAssessment.distinct('skillCategory');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get assessment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    let selectFields = '';
    
    // Don't show answers to students
    if (req.user.role === 'student') {
      selectFields = '-questions.correctAnswer -questions.explanation';
    }

    const assessment = await SkillAssessment.findById(req.params.id)
      .select(selectFields)
      .populate('createdBy', 'name');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/:id/start
// @desc    Get assessment for taking (with shuffled questions)
// @access  Private (Student)
router.get('/:id/start', auth, async (req, res) => {
  try {
    const assessment = await SkillAssessment.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (assessment.status !== 'Active') {
      return res.status(400).json({ message: 'Assessment is not active' });
    }

    // Check if student has remaining attempts
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const previousAttempts = await AssessmentResult.countDocuments({
      assessment: req.params.id,
      student: studentDoc._id
    });

    if (previousAttempts >= assessment.attemptsAllowed) {
      return res.status(400).json({ 
        message: 'Maximum attempts reached',
        attemptsUsed: previousAttempts,
        attemptsAllowed: assessment.attemptsAllowed
      });
    }

    // Shuffle questions if enabled
    let questions = [...assessment.questions];
    if (assessment.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    res.json({
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        skillCategory: assessment.skillCategory,
        duration: assessment.duration,
        instructions: assessment.instructions,
        totalQuestions: assessment.totalQuestions,
        totalPoints: assessment.totalPoints,
        passingScore: assessment.passingScore
      },
      questions: questions.map((q, index) => ({
        _id: q._id,
        questionNumber: index + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        points: q.points
      })),
      attemptNumber: previousAttempts + 1,
      attemptsRemaining: assessment.attemptsAllowed - previousAttempts - 1
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assessments/:id
// @desc    Update assessment
// @access  Private (Placement Officer, Mentor, Admin)
router.put('/:id', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const assessment = await SkillAssessment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json({
      message: 'Assessment updated successfully',
      assessment
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assessments/:id/status
// @desc    Update assessment status
// @access  Private (Placement Officer, Admin)
router.put('/:id/status', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const assessment = await SkillAssessment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json({
      message: 'Assessment status updated',
      assessment
    });
  } catch (error) {
    console.error('Error updating assessment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment
// @access  Private (Placement Officer, Admin)
router.delete('/:id', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const assessment = await SkillAssessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if there are any results for this assessment
    const resultsCount = await AssessmentResult.countDocuments({ assessment: req.params.id });
    
    if (resultsCount > 0) {
      // Soft delete by changing status
      assessment.status = 'Archived';
      await assessment.save();
      return res.json({ message: 'Assessment archived (has existing results)' });
    }

    await SkillAssessment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ASSESSMENT RESULTS ====================

// @route   POST /api/assessments/:id/submit
// @desc    Submit assessment answers
// @access  Private (Student)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const assessment = await SkillAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check attempts
    const previousAttempts = await AssessmentResult.countDocuments({
      assessment: req.params.id,
      student: studentDoc._id
    });

    if (previousAttempts >= assessment.attemptsAllowed) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Grade the assessment
    let score = 0;
    const gradedAnswers = answers.map(answer => {
      const question = assessment.questions.id(answer.questionId);
      if (!question) return { ...answer, isCorrect: false, pointsEarned: 0 };

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.questionType === 'MCQ' || question.questionType === 'True/False') {
        isCorrect = answer.selectedAnswer === question.correctAnswer;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'Short Answer') {
        // Simple string comparison (case-insensitive)
        isCorrect = answer.textAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'Coding' || question.questionType === 'Essay') {
        // These need manual grading
        isCorrect = null;
        pointsEarned = 0;
      }

      score += pointsEarned;

      return {
        question: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        textAnswer: answer.textAnswer,
        codeAnswer: answer.codeAnswer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = (score / assessment.totalPoints) * 100;
    const passed = percentage >= assessment.passingScore;

    // Determine skills verified
    const skillsVerified = passed ? [assessment.skillCategory] : [];

    const result = new AssessmentResult({
      assessment: assessment._id,
      student: studentDoc._id,
      answers: gradedAnswers,
      score,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      timeTaken: timeTaken || assessment.duration * 60,
      attemptNumber: previousAttempts + 1,
      skillsVerified
    });

    await result.save();

    // Update student's verified skills if passed
    if (passed && !studentDoc.skills?.includes(assessment.skillCategory)) {
      await Student.findByIdAndUpdate(studentDoc._id, {
        $addToSet: { skills: assessment.skillCategory }
      });
    }

    // Prepare response
    const response = {
      message: 'Assessment submitted successfully',
      result: {
        _id: result._id,
        score,
        totalPoints: assessment.totalPoints,
        percentage: result.percentage,
        passed,
        attemptNumber: result.attemptNumber
      }
    };

    // Include detailed results if showResults is enabled
    if (assessment.showResults) {
      response.result.answers = gradedAnswers.map(a => ({
        question: a.question,
        isCorrect: a.isCorrect,
        pointsEarned: a.pointsEarned
      }));
    }

    res.json(response);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/:id/results
// @desc    Get all results for an assessment
// @access  Private (Placement Officer, Mentor, Admin)
router.get('/:id/results', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const { passed, page = 1, limit = 20 } = req.query;

    let query = { assessment: req.params.id };
    if (passed !== undefined) {
      query.passed = passed === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await AssessmentResult.find(query)
      .populate('student', 'name email department batch')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AssessmentResult.countDocuments(query);

    // Calculate statistics
    const stats = await AssessmentResult.aggregate([
      { $match: { assessment: assessment._id } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$percentage' },
          maxScore: { $max: '$percentage' },
          minScore: { $min: '$percentage' },
          totalAttempts: { $sum: 1 },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } }
        }
      }
    ]);

    res.json({
      results,
      stats: stats[0] || {},
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/results/my
// @desc    Get student's own assessment results
// @access  Private (Student)
router.get('/results/my', auth, async (req, res) => {
  try {
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const results = await AssessmentResult.find({ student: studentDoc._id })
      .populate('assessment', 'title skillCategory difficulty totalPoints passingScore')
      .sort({ submittedAt: -1 });

    // Group by assessment to show best attempt
    const groupedResults = {};
    results.forEach(result => {
      const assessmentId = result.assessment._id.toString();
      if (!groupedResults[assessmentId] || result.percentage > groupedResults[assessmentId].percentage) {
        groupedResults[assessmentId] = result;
      }
    });

    res.json({
      allResults: results,
      bestResults: Object.values(groupedResults)
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/results/:resultId
// @desc    Get specific result details
// @access  Private
router.get('/results/:resultId', auth, async (req, res) => {
  try {
    const result = await AssessmentResult.findById(req.params.resultId)
      .populate('assessment')
      .populate('student', 'name email department');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Students can only view their own results
    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc || result.student._id.toString() !== studentDoc._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assessments/results/:resultId/grade
// @desc    Manually grade essay/coding questions
// @access  Private (Placement Officer, Mentor, Admin)
router.put('/results/:resultId/grade', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    const { grades } = req.body; // Array of { questionId, pointsEarned, feedback }

    const result = await AssessmentResult.findById(req.params.resultId);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const assessment = await SkillAssessment.findById(result.assessment);

    // Update grades for specified questions
    grades.forEach(grade => {
      const answer = result.answers.find(a => a.question.toString() === grade.questionId);
      if (answer) {
        answer.pointsEarned = grade.pointsEarned;
        answer.isCorrect = grade.pointsEarned > 0;
        if (grade.feedback) {
          answer.feedback = grade.feedback;
        }
      }
    });

    // Recalculate total score
    result.score = result.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    result.percentage = (result.score / assessment.totalPoints) * 100;
    result.passed = result.percentage >= assessment.passingScore;
    result.gradedBy = req.user._id;
    result.gradedAt = new Date();

    await result.save();

    res.json({
      message: 'Grades updated successfully',
      result
    });
  } catch (error) {
    console.error('Error grading result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/stats/overview
// @desc    Get overall assessment statistics
// @access  Private (Placement Officer, Admin)
router.get('/stats/overview', auth, authorize('placement_officer', 'admin', 'mentor'), async (req, res) => {
  try {
    const totalAssessments = await SkillAssessment.countDocuments();
    const activeAssessments = await SkillAssessment.countDocuments({ status: 'Active' });
    const totalAttempts = await AssessmentResult.countDocuments();
    
    const passStats = await AssessmentResult.aggregate([
      {
        $group: {
          _id: null,
          totalPassed: { $sum: { $cond: ['$passed', 1, 0] } },
          avgPercentage: { $avg: '$percentage' }
        }
      }
    ]);

    const categoryStats = await SkillAssessment.aggregate([
      {
        $group: {
          _id: '$skillCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentResults = await AssessmentResult.find()
      .populate('assessment', 'title skillCategory')
      .populate('student', 'name department')
      .sort({ submittedAt: -1 })
      .limit(10);

    res.json({
      totalAssessments,
      activeAssessments,
      totalAttempts,
      passRate: passStats[0] ? (passStats[0].totalPassed / totalAttempts * 100).toFixed(2) : 0,
      avgScore: passStats[0]?.avgPercentage?.toFixed(2) || 0,
      categoryStats,
      recentResults
    });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assessments/:id/generate-certificate
// @desc    Generate certificate for passed assessment
// @access  Private (Student)
router.post('/:id/generate-certificate', auth, async (req, res) => {
  try {
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const result = await AssessmentResult.findOne({
      assessment: req.params.id,
      student: studentDoc._id,
      passed: true
    }).sort({ percentage: -1 });

    if (!result) {
      return res.status(400).json({ message: 'No passing result found for this assessment' });
    }

    if (result.certificateGenerated) {
      return res.json({
        message: 'Certificate already generated',
        certificateId: result.certificateId
      });
    }

    // Generate certificate ID
    const certificateId = `CERT-${Date.now()}-${studentDoc._id.toString().slice(-6)}`;
    
    result.certificateGenerated = true;
    result.certificateId = certificateId;
    await result.save();

    res.json({
      message: 'Certificate generated successfully',
      certificateId,
      result: {
        assessmentTitle: (await SkillAssessment.findById(req.params.id)).title,
        studentName: studentDoc.name,
        score: result.percentage,
        completedAt: result.submittedAt
      }
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
