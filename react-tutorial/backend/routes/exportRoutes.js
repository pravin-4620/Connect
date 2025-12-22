const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Placement = require('../models/Placement');
const PlacementApplication = require('../models/PlacementApplication');
const Interview = require('../models/Interview');
const { SkillAssessment, AssessmentResult } = require('../models/SkillAssessment');
const Company = require('../models/Company');
const { auth, authorize } = require('../middleware/auth');

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// @route   GET /api/export/students
// @desc    Export student data
// @access  Private (Placement Officer, Admin)
router.get('/students', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { department, batch, status, format = 'json' } = req.query;

    let filter = {};
    if (department) filter.department = department;
    if (batch) filter.batch = batch;
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate('user', 'email')
      .sort({ name: 1 });

    // Check if student is placed
    const placedStudentIds = await Placement.distinct('student');
    const placedSet = new Set(placedStudentIds.map(id => id.toString()));

    const exportData = students.map(student => ({
      'Roll Number': student.rollNumber || '',
      'Name': student.name,
      'Email': student.user?.email || student.email || '',
      'Phone': student.phone || '',
      'Department': student.department || '',
      'Batch': student.batch || '',
      'CGPA': student.cgpa || '',
      'Skills': Array.isArray(student.skills) ? student.skills.join(', ') : '',
      'Status': student.status || 'Active',
      'Placement Status': placedSet.has(student._id.toString()) ? 'Placed' : 'Not Placed',
      'Address': student.address || '',
      'Date of Birth': formatDate(student.dateOfBirth),
      'Created At': formatDate(student.createdAt)
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      exportData.forEach(row => {
        csvRows.push(headers.map(header => {
          let value = row[header] || '';
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json({
      data: exportData,
      meta: {
        total: exportData.length,
        exportedAt: new Date(),
        filters: { department, batch, status }
      }
    });
  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/export/placements
// @desc    Export placement data
// @access  Private (Placement Officer, Admin)
router.get('/placements', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate, company, department, format = 'json' } = req.query;

    let filter = {};
    if (startDate || endDate) {
      filter.placementDate = {};
      if (startDate) filter.placementDate.$gte = new Date(startDate);
      if (endDate) filter.placementDate.$lte = new Date(endDate);
    }
    if (company) filter.company = { $regex: company, $options: 'i' };

    let placements = await Placement.find(filter)
      .populate('student', 'name email phone department batch cgpa rollNumber')
      .sort({ placementDate: -1 });

    // Filter by department if specified
    if (department) {
      placements = placements.filter(p => p.student?.department === department);
    }

    const exportData = placements.map(placement => ({
      'Student Name': placement.student?.name || '',
      'Roll Number': placement.student?.rollNumber || '',
      'Email': placement.student?.email || '',
      'Phone': placement.student?.phone || '',
      'Department': placement.student?.department || '',
      'Batch': placement.student?.batch || '',
      'CGPA': placement.student?.cgpa || '',
      'Company': placement.company || '',
      'Position': placement.position || '',
      'Package (LPA)': placement.package ? (placement.package / 100000).toFixed(2) : '',
      'Package (INR)': formatCurrency(placement.package),
      'Placement Type': placement.placementType || '',
      'Location': placement.location || '',
      'Joining Date': formatDate(placement.joiningDate),
      'Placement Date': formatDate(placement.placementDate),
      'Offer Letter': placement.offerLetter ? 'Yes' : 'No',
      'Status': placement.status || ''
    }));

    // Calculate summary
    const summary = {
      totalPlacements: exportData.length,
      averagePackage: placements.length > 0 
        ? formatCurrency(placements.reduce((sum, p) => sum + (p.package || 0), 0) / placements.length)
        : 0,
      highestPackage: formatCurrency(Math.max(...placements.map(p => p.package || 0))),
      lowestPackage: formatCurrency(Math.min(...placements.filter(p => p.package).map(p => p.package)))
    };

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      exportData.forEach(row => {
        csvRows.push(headers.map(header => {
          let value = row[header] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=placements.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json({
      data: exportData,
      summary,
      meta: {
        total: exportData.length,
        exportedAt: new Date(),
        filters: { startDate, endDate, company, department }
      }
    });
  } catch (error) {
    console.error('Error exporting placements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/export/interviews
// @desc    Export interview data
// @access  Private (Placement Officer, Admin)
router.get('/interviews', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate, company, status, format = 'json' } = req.query;

    let filter = {};
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (status) filter.status = status;

    const interviews = await Interview.find(filter)
      .populate('student', 'name email phone department batch')
      .sort({ scheduledDate: 1, scheduledTime: 1 });

    const exportData = interviews.map(interview => ({
      'Student Name': interview.student?.name || '',
      'Email': interview.student?.email || '',
      'Phone': interview.student?.phone || '',
      'Department': interview.student?.department || '',
      'Company': interview.company || '',
      'Role': interview.role || '',
      'Interview Type': interview.interviewType || '',
      'Mode': interview.mode || '',
      'Scheduled Date': formatDate(interview.scheduledDate),
      'Scheduled Time': interview.scheduledTime || '',
      'Duration (mins)': interview.duration || '',
      'Round': interview.round || '',
      'Status': interview.status || '',
      'Result': interview.result || '',
      'Venue/Link': interview.mode === 'Virtual' ? interview.meetingLink : interview.venue || '',
      'Interviewers': Array.isArray(interview.interviewers) ? interview.interviewers.join(', ') : ''
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      exportData.forEach(row => {
        csvRows.push(headers.map(header => {
          let value = row[header] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=interviews.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json({
      data: exportData,
      meta: {
        total: exportData.length,
        exportedAt: new Date(),
        filters: { startDate, endDate, company, status }
      }
    });
  } catch (error) {
    console.error('Error exporting interviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/export/assessments
// @desc    Export assessment results
// @access  Private (Placement Officer, Admin)
router.get('/assessments', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { assessmentId, passed, format = 'json' } = req.query;

    let filter = {};
    if (assessmentId) filter.assessment = assessmentId;
    if (passed !== undefined) filter.passed = passed === 'true';

    const results = await AssessmentResult.find(filter)
      .populate('student', 'name email department batch rollNumber')
      .populate('assessment', 'title skillCategory difficulty passingScore')
      .sort({ submittedAt: -1 });

    const exportData = results.map(result => ({
      'Student Name': result.student?.name || '',
      'Roll Number': result.student?.rollNumber || '',
      'Email': result.student?.email || '',
      'Department': result.student?.department || '',
      'Batch': result.student?.batch || '',
      'Assessment Title': result.assessment?.title || '',
      'Skill Category': result.assessment?.skillCategory || '',
      'Difficulty': result.assessment?.difficulty || '',
      'Score': result.score || 0,
      'Percentage': result.percentage?.toFixed(2) + '%' || '',
      'Passing Score': result.assessment?.passingScore + '%' || '',
      'Result': result.passed ? 'PASSED' : 'FAILED',
      'Attempt Number': result.attemptNumber || 1,
      'Time Taken (mins)': result.timeTaken ? Math.round(result.timeTaken / 60) : '',
      'Submitted At': formatDate(result.submittedAt),
      'Certificate ID': result.certificateId || ''
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      exportData.forEach(row => {
        csvRows.push(headers.map(header => {
          let value = row[header] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=assessment-results.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json({
      data: exportData,
      meta: {
        total: exportData.length,
        exportedAt: new Date(),
        filters: { assessmentId, passed }
      }
    });
  } catch (error) {
    console.error('Error exporting assessments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/export/companies
// @desc    Export company data
// @access  Private (Placement Officer, Admin)
router.get('/companies', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { industry, status, format = 'json' } = req.query;

    let filter = {};
    if (industry) filter.industry = industry;
    if (status) filter.status = status;

    const companies = await Company.find(filter).sort({ name: 1 });

    // Get placement count per company
    const placementCounts = await Placement.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } }
    ]);
    const placementMap = new Map(placementCounts.map(p => [p._id, p.count]));

    const exportData = companies.map(company => ({
      'Company Name': company.name || '',
      'Industry': company.industry || '',
      'Company Type': company.companyType || '',
      'Website': company.website || '',
      'Email': company.email || '',
      'Phone': company.phone || '',
      'Address': company.address || '',
      'City': company.city || '',
      'Description': company.description || '',
      'HR Contact': company.hrContact?.name || '',
      'HR Email': company.hrContact?.email || '',
      'HR Phone': company.hrContact?.phone || '',
      'Status': company.status || '',
      'Total Placements': placementMap.get(company.name) || 0,
      'Created At': formatDate(company.createdAt)
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      exportData.forEach(row => {
        csvRows.push(headers.map(header => {
          let value = row[header] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json({
      data: exportData,
      meta: {
        total: exportData.length,
        exportedAt: new Date(),
        filters: { industry, status }
      }
    });
  } catch (error) {
    console.error('Error exporting companies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/export/report
// @desc    Export comprehensive placement report
// @access  Private (Placement Officer, Admin)
router.get('/report', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { year, department, format = 'json' } = req.query;

    let dateFilter = {};
    if (year) {
      dateFilter.placementDate = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      };
    }

    // Get all required data
    const totalStudents = await Student.countDocuments(department ? { department } : {});
    const placements = await Placement.find(dateFilter)
      .populate('student', 'name department batch cgpa');

    // Filter by department if needed
    const filteredPlacements = department 
      ? placements.filter(p => p.student?.department === department)
      : placements;

    // Calculate statistics
    const packages = filteredPlacements.map(p => p.package || 0).filter(p => p > 0);
    
    const report = {
      reportTitle: `Placement Report ${year || 'All Time'}${department ? ` - ${department}` : ''}`,
      generatedAt: new Date(),
      summary: {
        totalStudents,
        totalPlacements: filteredPlacements.length,
        placementRate: totalStudents > 0 
          ? ((filteredPlacements.length / totalStudents) * 100).toFixed(2) + '%'
          : '0%',
        averagePackage: packages.length > 0 
          ? formatCurrency(packages.reduce((a, b) => a + b, 0) / packages.length)
          : 'N/A',
        highestPackage: packages.length > 0 ? formatCurrency(Math.max(...packages)) : 'N/A',
        lowestPackage: packages.length > 0 ? formatCurrency(Math.min(...packages)) : 'N/A',
        medianPackage: packages.length > 0 
          ? formatCurrency(packages.sort((a, b) => a - b)[Math.floor(packages.length / 2)])
          : 'N/A'
      },
      departmentWise: await Placement.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        { $unwind: '$studentInfo' },
        ...(department ? [{ $match: { 'studentInfo.department': department } }] : []),
        {
          $group: {
            _id: '$studentInfo.department',
            placements: { $sum: 1 },
            avgPackage: { $avg: '$package' },
            maxPackage: { $max: '$package' }
          }
        },
        { $sort: { placements: -1 } }
      ]),
      companyWise: await Placement.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        { $unwind: '$studentInfo' },
        ...(department ? [{ $match: { 'studentInfo.department': department } }] : []),
        {
          $group: {
            _id: '$company',
            placements: { $sum: 1 },
            avgPackage: { $avg: '$package' }
          }
        },
        { $sort: { placements: -1 } },
        { $limit: 15 }
      ]),
      monthlyTrend: await Placement.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'studentInfo'
          }
        },
        { $unwind: '$studentInfo' },
        ...(department ? [{ $match: { 'studentInfo.department': department } }] : []),
        {
          $group: {
            _id: {
              year: { $year: '$placementDate' },
              month: { $month: '$placementDate' }
            },
            placements: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/export/applications
// @desc    Export placement applications
// @access  Private (Placement Officer, Admin)
router.get('/applications', auth, authorize('placement_officer', 'admin'), async (req, res) => {
  try {
    const { status, driveId, format = 'json' } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (driveId) filter.placementDrive = driveId;

    const applications = await PlacementApplication.find(filter)
      .populate('student', 'name email phone department batch cgpa rollNumber')
      .populate('placementDrive', 'title company')
      .sort({ appliedAt: -1 });

    const exportData = applications.map(app => ({
      'Student Name': app.student?.name || '',
      'Roll Number': app.student?.rollNumber || '',
      'Email': app.student?.email || '',
      'Phone': app.student?.phone || '',
      'Department': app.student?.department || '',
      'Batch': app.student?.batch || '',
      'CGPA': app.student?.cgpa || '',
      'Drive Title': app.placementDrive?.title || '',
      'Company': app.placementDrive?.company || '',
      'Status': app.status || '',
      'Applied At': formatDate(app.appliedAt),
      'Resume': app.resume ? 'Uploaded' : 'Not Uploaded',
      'Cover Letter': app.coverLetter ? 'Yes' : 'No'
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      exportData.forEach(row => {
        csvRows.push(headers.map(header => {
          let value = row[header] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json({
      data: exportData,
      meta: {
        total: exportData.length,
        exportedAt: new Date(),
        filters: { status, driveId }
      }
    });
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
