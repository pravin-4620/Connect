const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/students
// @desc    Create student profile
// @access  Private (Student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    // Check if student profile already exists
    let student = await Student.findOne({ user: req.user.id });
    if (student) {
      return res.status(400).json({ message: 'Student profile already exists' });
    }

    // Create student profile
    student = await Student.create({
      user: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students
// @desc    Get all students with advanced filtering
// @access  Private (Mentor, Placement Officer)
router.get('/', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const {
      search,
      department,
      batch,
      status,
      skills,
      minCGPA,
      maxCGPA,
      placementStatus,
      sortBy,
      sortOrder,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    let query = {};

    // Text search (name, email, rollNumber)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Department filter
    if (department) {
      if (department.includes(',')) {
        query.department = { $in: department.split(',') };
      } else {
        query.department = department;
      }
    }

    // Batch filter
    if (batch) {
      if (batch.includes(',')) {
        query.batch = { $in: batch.split(',') };
      } else {
        query.batch = batch;
      }
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Skills filter (match any of the provided skills)
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    // CGPA range filter
    if (minCGPA || maxCGPA) {
      query.cgpa = {};
      if (minCGPA) query.cgpa.$gte = parseFloat(minCGPA);
      if (maxCGPA) query.cgpa.$lte = parseFloat(maxCGPA);
    }

    // Build sort options
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // Default sort by name
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    let students = await Student.find(query)
      .populate('user', 'name email')
      .populate('mentor', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by placement status if needed
    if (placementStatus) {
      const Placement = require('../models/Placement');
      const placedStudentIds = await Placement.distinct('student');
      const placedSet = new Set(placedStudentIds.map(id => id.toString()));

      if (placementStatus === 'placed') {
        students = students.filter(s => placedSet.has(s._id.toString()));
      } else if (placementStatus === 'unplaced') {
        students = students.filter(s => !placedSet.has(s._id.toString()));
      }
    }

    // Get total count for pagination
    const total = await Student.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/search
// @desc    Advanced search with full-text and filters
// @access  Private (Mentor, Placement Officer)
router.get('/search', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const { q, filters } = req.query;
    
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (e) {
        // Ignore parse errors
      }
    }

    let query = {};

    // Full-text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { department: { $regex: q, $options: 'i' } }
      ];
    }

    // Apply additional filters
    if (parsedFilters.departments?.length) {
      query.department = { $in: parsedFilters.departments };
    }
    if (parsedFilters.batches?.length) {
      query.batch = { $in: parsedFilters.batches };
    }
    if (parsedFilters.skills?.length) {
      query.skills = { $in: parsedFilters.skills };
    }
    if (parsedFilters.minCGPA) {
      query.cgpa = { ...query.cgpa, $gte: parsedFilters.minCGPA };
    }
    if (parsedFilters.maxCGPA) {
      query.cgpa = { ...query.cgpa, $lte: parsedFilters.maxCGPA };
    }

    const students = await Student.find(query)
      .populate('user', 'name email')
      .populate('mentor', 'name email')
      .sort({ name: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/filters
// @desc    Get filter options (departments, batches, skills)
// @access  Private (Mentor, Placement Officer)
router.get('/filters', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const departments = await Student.distinct('department');
    const batches = await Student.distinct('batch');
    const skills = await Student.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills' } },
      { $sort: { _id: 1 } }
    ]).then(results => results.map(r => r._id));

    const cgpaRange = await Student.aggregate([
      {
        $group: {
          _id: null,
          minCGPA: { $min: '$cgpa' },
          maxCGPA: { $max: '$cgpa' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        departments: departments.filter(d => d),
        batches: batches.filter(b => b).sort(),
        skills: skills.filter(s => s),
        cgpaRange: cgpaRange[0] || { minCGPA: 0, maxCGPA: 10 }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/stats
// @desc    Get student statistics
// @access  Private (Mentor, Placement Officer)
router.get('/stats', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const Placement = require('../models/Placement');
    
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Placement.distinct('student').then(ids => ids.length);
    
    const byDepartment = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, avgCGPA: { $avg: '$cgpa' } } },
      { $sort: { count: -1 } }
    ]);

    const byBatch = await Student.aggregate([
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

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

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
        byDepartment,
        byBatch,
        cgpaDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/me
// @desc    Get current student profile
// @access  Private (Student)
router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email')
      .populate('mentor', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('mentor', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/me
// @desc    Update student profile
// @access  Private (Student)
router.put('/me', protect, authorize('student'), async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student = await Student.findByIdAndUpdate(
      student._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student by ID (for mentors/officers)
// @access  Private (Mentor, Placement Officer)
router.put('/:id', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Placement Officer)
router.delete('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
