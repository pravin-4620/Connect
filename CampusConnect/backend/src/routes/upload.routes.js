
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images, pdfs, docs
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
});

// Route
router.post('/', authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return error(res, 'No file uploaded', 400);
        }

        // Return the URL (assuming server serves uploads/ at root or /uploads)
        // We will configure server.js to serve /uploads
        const fileUrl = `/uploads/${req.file.filename}`;

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
