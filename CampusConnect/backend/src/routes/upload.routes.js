import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Upload route using Cloudinary
router.post('/', authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return error(res, 'No file uploaded', 400);
        }

        // Cloudinary automatically uploads and returns the URL
        const fileUrl = req.file.path; // This is the Cloudinary URL

        return success(res, {
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        }, 'File uploaded successfully');
    } catch (err) {
        console.error('Upload error:', err);
        return error(res, 'File upload failed', 500);
    }
});

export default router;
