const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Placement = require('../models/Placement');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');
const Interview = require('../models/Interview');
const { SkillAssessment, AssessmentResult } = require('../models/SkillAssessment');
const Company = require('../models/Company');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get main dashboard statistics
// @access  Private (Placement Officer, Mentor, Admin)
router.get('/dashboard', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    // Student Statistics
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Placement.distinct('student').then(ids => ids.length);
    const activeStudents = await Student.countDocuments({ status: 'Active' });

    // Placement Statistics
    const totalPlacements = await Placement.countDocuments();
    const activeDrives = await PlacementDrive.countDocuments({ status: 'Open' });
    const totalApplications = await PlacementApplication.countDocuments();

    // Interview Statistics
    const totalInterviews = await Interview.countDocuments();
    const upcomingInterviews = await Interview.countDocuments({
      scheduledDate: { $gte: new Date() },
      status: { $in: ['Scheduled', 'Confirmed'] }
    });

    // Company Statistics
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: 'Active' });

    // Calculate placement rate
    const placementRate = totalStudents > 0 
      ? ((placedStudents / totalStudents) * 100).toFixed(2) 
      : 0;

    res.json({
      students: {
        total: totalStudents,
        placed: placedStudents,
        active: activeStudents,
        placementRate: parseFloat(placementRate)
      },
      placements: {
        total: totalPlacements,
        activeDrives,
        applications: totalApplications
      },
      interviews: {
        total: totalInterviews,
        upcoming: upcomingInterviews
      },
      companies: {
        total: totalCompanies,
        active: activeCompanies
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/placements
// @desc    Get placement analytics
// @access  Private (Placement Officer, Admin)
router.get('/placements', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { year, department } = req.query;
    
    let matchStage = {};
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01`);
      matchStage.placementDate = { $gte: startDate, $lt: endDate };
    }

    // Placements by Month
    const monthlyPlacements = await Placement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$placementDate' },
            month: { $month: '$placementDate' }
          },
          count: { $sum: 1 },
          totalPackage: { $sum: '$package' },
          avgPackage: { $avg: '$package' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Placements by Department
    const departmentPlacements = await Placement.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.department',
          count: { $sum: 1 },
          avgPackage: { $avg: '$package' },
          maxPackage: { $max: '$package' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top Companies by Placements
    const topCompanies = await Placement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$company',
          placements: { $sum: 1 },
          avgPackage: { $avg: '$package' }
        }
      },
      { $sort: { placements: -1 } },
      { $limit: 10 }
    ]);

    // Package Distribution
    const packageDistribution = await Placement.aggregate([
      { $match: matchStage },
      {
        $bucket: {
          groupBy: '$package',
          boundaries: [0, 300000, 500000, 800000, 1000000, 1500000, 2000000, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Overall Stats
    const overallStats = await Placement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPlacements: { $sum: 1 },
          avgPackage: { $avg: '$package' },
          maxPackage: { $max: '$package' },
          minPackage: { $min: '$package' },
          totalPackageValue: { $sum: '$package' }
        }
      }
    ]);

    res.json({
      monthlyPlacements,
      departmentPlacements,
      topCompanies,
      packageDistribution,
      overallStats: overallStats[0] || {}
    });
  } catch (error) {
    console.error('Error fetching placement analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/students
// @desc    Get student analytics
// @access  Private (Placement Officer, Mentor, Admin)
router.get('/students', auth, authorize('placement_officer', 'mentor', 'admin'), async (req, res) => {
  try {
    // Students by Department
    const byDepartment = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          avgCGPA: { $avg: '$cgpa' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Students by Batch
    const byBatch = await Student.aggregate([
      {
        $group: {
          _id: '$batch',
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // CGPA Distribution
    const cgpaDistribution = await Student.aggregate([
      {
        $bucket: {
          groupBy: '$cgpa',
          boundaries: [0, 5, 6, 7, 8, 9, 10.1],
          default: 'Unknown',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Skills Distribution
    const skillsDistribution = await Student.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Placement Status
    const placedStudentIds = await Placement.distinct('student');
    const placementStatus = {
      placed: placedStudentIds.length,
      unplaced: await Student.countDocuments({ _id: { $nin: placedStudentIds } })
    };

    // Students with Applications
    const studentsWithApplications = await PlacementApplication.distinct('student');

    res.json({
      byDepartment,
      byBatch,
      cgpaDistribution,
      skillsDistribution,
      placementStatus,
      applicationStats: {
        applied: studentsWithApplications.length,
        notApplied: await Student.countDocuments({ _id: { $nin: studentsWithApplications } })
      }
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get placement trends over time
// @access  Private (Placement Officer, Admin)
router.get('/trends', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { years = 3 } = req.query;
    const startYear = new Date().getFullYear() - parseInt(years);

    // Yearly Placement Trends
    const yearlyTrends = await Placement.aggregate([
      {
        $match: {
          placementDate: { $gte: new Date(`${startYear}-01-01`) }
        }
      },
      {
        $group: {
          _id: { $year: '$placementDate' },
          placements: { $sum: 1 },
          avgPackage: { $avg: '$package' },
          maxPackage: { $max: '$package' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Company Participation Trends
    const companyTrends = await PlacementDrive.aggregate([
      {
        $match: {
          startDate: { $gte: new Date(`${startYear}-01-01`) }
        }
      },
      {
        $group: {
          _id: { $year: '$startDate' },
          drives: { $sum: 1 },
          companies: { $addToSet: '$company' }
        }
      },
      {
        $project: {
          _id: 1,
          drives: 1,
          uniqueCompanies: { $size: '$companies' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Application to Placement Conversion Rate
    const conversionTrends = await PlacementApplication.aggregate([
      {
        $match: {
          appliedAt: { $gte: new Date(`${startYear}-01-01`) }
        }
      },
      {
        $group: {
          _id: { $year: '$appliedAt' },
          totalApplications: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 1,
          totalApplications: 1,
          selected: 1,
          conversionRate: {
            $multiply: [{ $divide: ['$selected', '$totalApplications'] }, 100]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      yearlyTrends,
      companyTrends,
      conversionTrends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/interviews
// @desc    Get interview analytics
// @access  Private (Placement Officer, Admin)
router.get('/interviews', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    // Interview Status Distribution
    const statusDistribution = await Interview.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Interview Results Distribution
    const resultDistribution = await Interview.aggregate([
      { $match: { result: { $ne: null } } },
      {
        $group: {
          _id: '$result',
          count: { $sum: 1 }
        }
      }
    ]);

    // Interviews by Type
    const byType = await Interview.aggregate([
      {
        $group: {
          _id: '$interviewType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Interviews by Mode
    const byMode = await Interview.aggregate([
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly Interview Trends
    const monthlyTrends = await Interview.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          count: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$result', 'Selected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Success Rate by Company
    const companySuccessRate = await Interview.aggregate([
      { $match: { result: { $ne: null } } },
      {
        $group: {
          _id: '$company',
          total: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$result', 'Selected'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 1,
          total: 1,
          selected: 1,
          successRate: {
            $multiply: [{ $divide: ['$selected', '$total'] }, 100]
          }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      statusDistribution,
      resultDistribution,
      byType,
      byMode,
      monthlyTrends,
      companySuccessRate
    });
  } catch (error) {
    console.error('Error fetching interview analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/assessments
// @desc    Get skill assessment analytics
// @access  Private (Placement Officer, Admin)
router.get('/assessments', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    // Assessment Overview
    const totalAssessments = await SkillAssessment.countDocuments();
    const totalAttempts = await AssessmentResult.countDocuments();
    
    // Pass/Fail Distribution
    const passFailDistribution = await AssessmentResult.aggregate([
      {
        $group: {
          _id: '$passed',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average Scores by Category
    const categoryScores = await AssessmentResult.aggregate([
      {
        $lookup: {
          from: 'skillassessments',
          localField: 'assessment',
          foreignField: '_id',
          as: 'assessmentInfo'
        }
      },
      { $unwind: '$assessmentInfo' },
      {
        $group: {
          _id: '$assessmentInfo.skillCategory',
          avgScore: { $avg: '$percentage' },
          attempts: { $sum: 1 },
          passCount: { $sum: { $cond: ['$passed', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 1,
          avgScore: { $round: ['$avgScore', 2] },
          attempts: 1,
          passRate: {
            $round: [{ $multiply: [{ $divide: ['$passCount', '$attempts'] }, 100] }, 2]
          }
        }
      },
      { $sort: { attempts: -1 } }
    ]);

    // Score Distribution
    const scoreDistribution = await AssessmentResult.aggregate([
      {
        $bucket: {
          groupBy: '$percentage',
          boundaries: [0, 20, 40, 60, 80, 100.1],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Top Performers
    const topPerformers = await AssessmentResult.aggregate([
      {
        $group: {
          _id: '$student',
          avgScore: { $avg: '$percentage' },
          assessmentsTaken: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } }
        }
      },
      { $match: { assessmentsTaken: { $gte: 2 } } },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $project: {
          name: '$studentInfo.name',
          department: '$studentInfo.department',
          avgScore: { $round: ['$avgScore', 2] },
          assessmentsTaken: 1,
          passed: 1
        }
      }
    ]);

    // Monthly Assessment Activity
    const monthlyActivity = await AssessmentResult.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          attempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      overview: {
        totalAssessments,
        totalAttempts,
        passRate: passFailDistribution.find(d => d._id === true)?.count 
          ? ((passFailDistribution.find(d => d._id === true).count / totalAttempts) * 100).toFixed(2)
          : 0
      },
      passFailDistribution,
      categoryScores,
      scoreDistribution,
      topPerformers,
      monthlyActivity
    });
  } catch (error) {
    console.error('Error fetching assessment analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/companies
// @desc    Get company analytics
// @access  Private (Placement Officer, Admin)
router.get('/companies', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    // Companies by Industry
    const byIndustry = await Company.aggregate([
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Companies by Type
    const byType = await Company.aggregate([
      {
        $group: {
          _id: '$companyType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top Recruiters (by placements)
    const topRecruiters = await Placement.aggregate([
      {
        $group: {
          _id: '$company',
          placements: { $sum: 1 },
          avgPackage: { $avg: '$package' }
        }
      },
      { $sort: { placements: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: 'name',
          as: 'companyInfo'
        }
      }
    ]);

    // Package Offered by Company Type
    const packageByType = await Placement.aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: 'name',
          as: 'companyInfo'
        }
      },
      { $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$companyInfo.companyType',
          avgPackage: { $avg: '$package' },
          maxPackage: { $max: '$package' },
          placements: { $sum: 1 }
        }
      }
    ]);

    // New Companies This Year
    const currentYear = new Date().getFullYear();
    const newCompaniesThisYear = await Company.countDocuments({
      createdAt: { $gte: new Date(`${currentYear}-01-01`) }
    });

    res.json({
      byIndustry,
      byType,
      topRecruiters,
      packageByType,
      newCompaniesThisYear,
      totalCompanies: await Company.countDocuments()
    });
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/report
// @desc    Get comprehensive report data
// @access  Private (Placement Officer, Admin)
router.get('/report', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate, department, batch } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        placementDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Build student filter
    let studentFilter = {};
    if (department) studentFilter.department = department;
    if (batch) studentFilter.batch = batch;

    // Get students matching filter
    const students = await Student.find(studentFilter).select('_id');
    const studentIds = students.map(s => s._id);

    // Combined filter
    let combinedFilter = { ...dateFilter };
    if (studentIds.length > 0) {
      combinedFilter.student = { $in: studentIds };
    }

    // Fetch all relevant data
    const placements = await Placement.find(combinedFilter)
      .populate('student', 'name email department batch cgpa')
      .sort({ placementDate: -1 });

    const summary = await Placement.aggregate([
      { $match: combinedFilter },
      {
        $group: {
          _id: null,
          totalPlacements: { $sum: 1 },
          avgPackage: { $avg: '$package' },
          maxPackage: { $max: '$package' },
          minPackage: { $min: '$package' },
          totalValue: { $sum: '$package' }
        }
      }
    ]);

    const departmentSummary = await Placement.aggregate([
      { $match: combinedFilter },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.department',
          placements: { $sum: 1 },
          avgPackage: { $avg: '$package' }
        }
      },
      { $sort: { placements: -1 } }
    ]);

    res.json({
      filters: { startDate, endDate, department, batch },
      summary: summary[0] || {},
      departmentSummary,
      placements,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
