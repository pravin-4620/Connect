const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/resumes', 'uploads/assignments', 'uploads/resources'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'profilePhoto') {
      uploadPath = 'uploads/profiles/';
    } else if (file.fieldname === 'resume') {
      uploadPath = 'uploads/resumes/';
    } else if (file.fieldname === 'assignment') {
      uploadPath = 'uploads/assignments/';
    } else if (file.fieldname === 'resource') {
      uploadPath = 'uploads/resources/';
    }
    
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for different types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePhoto') {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image file (JPG, PNG, GIF)'), false);
    }
  } else if (file.fieldname === 'resume') {
    // Accept PDF and DOC files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a PDF or Word document'), false);
    }
  } else if (file.fieldname === 'assignment' || file.fieldname === 'resource') {
    // Accept various document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, ZIP, TXT, Images'), false);
    }
  } else {
    cb(null, true);
  }
};

// Create multer upload instances
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Export different upload configurations
module.exports = {
  uploadProfilePhoto: upload.single('profilePhoto'),
  uploadResume: upload.single('resume'),
  uploadAssignment: upload.single('assignment'),
  uploadResource: upload.single('resource'),
  uploadMultiple: upload.array('files', 5)
};
