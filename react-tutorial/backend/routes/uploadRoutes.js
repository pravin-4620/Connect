const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfilePhoto, uploadResume, uploadAssignment, uploadResource } = require('../middleware/upload');
const User = require('../models/User');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const StudyResource = require('../models/StudyResource');

// @route   POST /api/upload/profile-photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile-photo', protect, uploadProfilePhoto, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    // Delete old profile photo if exists
    const user = await User.findById(req.user.id);
    if (user.photo && user.photo.startsWith('/uploads/')) {
      const oldPhotoPath = path.join(__dirname, '..', user.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update user with new photo path
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { photo: photoPath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        photoUrl: photoPath,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          photo: updatedUser.photo
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/upload/resume
// @desc    Upload resume
// @access  Private (Student)
router.post('/resume', protect, authorize('student'), uploadResume, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    // Find student profile
    let student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    // Delete old resume if exists
    if (student.resume && student.resume.startsWith('/uploads/')) {
      const oldResumePath = path.join(__dirname, '..', student.resume);
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    // Update student with new resume path
    const resumePath = `/uploads/resumes/${req.file.filename}`;
    student = await Student.findByIdAndUpdate(
      student._id,
      { resume: resumePath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: resumePath,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/upload/assignment/:assignmentId
// @desc    Submit assignment file
// @access  Private (Student)
router.post('/assignment/:assignmentId', protect, authorize('student'), uploadAssignment, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const filePath = `/uploads/assignments/${req.file.filename}`;

    // Create submission record (you can create a Submission model for this)
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        assignmentId: req.params.assignmentId,
        fileUrl: filePath,
        originalName: req.file.originalname,
        submittedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/upload/resource
// @desc    Upload study resource
// @access  Private (Mentor/Student)
router.post('/resource', protect, authorize('mentor', 'student'), uploadResource, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { title, subject, description, resourceType } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, error: 'Title and subject are required' });
    }

    const filePath = `/uploads/resources/${req.file.filename}`;

    // Create the study resource
    const resource = await StudyResource.create({
      title,
      subject,
      description: description || '',
      resourceType: resourceType || 'Notes',
      fileUrl: filePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      isApproved: req.user.role === 'mentor' // Auto-approve for mentors
    });

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      data: resource
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/upload/profile-photo
// @desc    Remove profile photo
// @access  Private
router.delete('/profile-photo', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.photo && user.photo.startsWith('/uploads/')) {
      const photoPath = path.join(__dirname, '..', user.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await User.findByIdAndUpdate(req.user.id, { photo: '' });

    res.status(200).json({
      success: true,
      message: 'Profile photo removed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
