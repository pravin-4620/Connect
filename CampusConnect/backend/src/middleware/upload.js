import multer from 'multer';

// Use memory storage to process files before S3 upload
const storage = multer.memoryStorage();

// File filter to allow specific types
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX and Images are allowed'), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter
});
