const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/jobs
// @desc    Create a new job/placement
// @access  Private (Placement Officer)
router.post('/', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Filter by status (students only see open jobs)
    if (req.user.role === 'student') {
      query.status = 'open';
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo industry location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo industry location description website')
      .populate('applications.student', 'rollNumber department year cgpa');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Placement Officer)
router.put('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Placement Officer)
router.delete('/:id', protect, authorize('placement_officer'), async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Student)
router.post('/:id/apply', protect, authorize('student'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get student profile
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Please create your profile first.' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.some(
      app => app.student.toString() === student._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add application
    job.applications.push({
      student: student._id,
      status: 'pending'
    });

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:jobId/applications/:applicationId
// @desc    Update application status
// @access  Private (Mentor, Placement Officer)
router.put('/:jobId/applications/:applicationId', protect, authorize('mentor', 'placement_officer'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = job.applications.id(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs/student/applications
// @desc    Get student's job applications
// @access  Private (Student)
router.get('/student/applications', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const jobs = await Job.find({ 'applications.student': student._id })
      .populate('company', 'name logo industry location');

    const applications = jobs.map(job => {
      const application = job.applications.find(
        app => app.student.toString() === student._id.toString()
      );
      return {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          type: job.type,
          location: job.location
        },
        status: application.status,
        appliedAt: application.appliedAt
      };
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
