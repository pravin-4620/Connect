import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * File type validation
 */
const FILE_TYPES = {
    resume: {
        extensions: ['.pdf', '.docx'],
        maxSize: 5 * 1024 * 1024, // 5MB
        mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    assignment: {
        extensions: ['.pdf', '.docx', '.zip'],
        maxSize: 10 * 1024 * 1024, // 10MB
        mimeTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip'
        ]
    },
    studyMaterial: {
        extensions: ['.pdf', '.ppt', '.pptx', '.zip', '.doc', '.docx'],
        maxSize: 50 * 1024 * 1024, // 50MB
        mimeTypes: [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-zip-compressed',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    },
    profilePicture: {
        extensions: ['.jpg', '.jpeg', '.png'],
        maxSize: 2 * 1024 * 1024, // 2MB
        mimeTypes: ['image/jpeg', 'image/png']
    }
};

/**
 * Validate file
 */
const validateFile = (file, fileType) => {
    const config = FILE_TYPES[fileType];

    if (!config) {
        throw new Error('Invalid file type');
    }

    // Check file size
    if (file.size > config.maxSize) {
        throw new Error(`File size exceeds ${config.maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!config.extensions.includes(ext)) {
        throw new Error(`Invalid file extension. Allowed: ${config.extensions.join(', ')}`);
    }

    // Check MIME type
    if (!config.mimeTypes.includes(file.mimetype)) {
        throw new Error(`Invalid file type. Allowed: ${config.mimeTypes.join(', ')}`);
    }

    return true;
};

/**
 * Upload buffer to Cloudinary using a stream
 */
const uploadToCloudinary = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Upload file to Cloudinary
 */
export const uploadFile = async (file, fileType, folder = '') => {
    try {
        // Validate file
        validateFile(file, fileType);

        // Upload to Cloudinary
        const options = {
            folder: folder ? `campusconnect/${folder}` : 'campusconnect',
            resource_type: 'auto',
            public_id: `${fileType}-${uuidv4()}`
        };

        const result = await uploadToCloudinary(file.buffer, options);

        return {
            url: result.secure_url,
            key: result.public_id,
            fileName: `${result.public_id}.${result.format}`,
            size: result.bytes,
            mimeType: file.mimetype
        };
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};

/**
 * Upload resume
 */
export const uploadResume = async (file, userId) => {
    return await uploadFile(file, 'resume', `resumes/${userId}`);
};

/**
 * Upload assignment
 */
export const uploadAssignment = async (file, studentId, assignmentId) => {
    return await uploadFile(file, 'assignment', `assignments/${assignmentId}/${studentId}`);
};

/**
 * Upload study material
 */
export const uploadStudyMaterial = async (file, mentorId) => {
    return await uploadFile(file, 'studyMaterial', `study-materials/${mentorId}`);
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file, userId) => {
    return await uploadFile(file, 'profilePicture', `profiles/${userId}`);
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('File deletion error:', error);
        throw error;
    }
};

/**
 * Generate URL for file access
 * @param {string} publicId - Cloudinary public ID
 */
export const getPresignedUrl = async (publicId) => {
    try {
        // For Cloudinary, we can just return the URL or use a signed one if private
        return cloudinary.url(publicId, { secure: true });
    } catch (error) {
        console.error('URL generation error:', error);
        throw error;
    }
};

/**
 * Extract file public ID from Cloudinary URL
 */
export const extractFileKey = (fileUrl) => {
    try {
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v12345678/folder/public_id.jpg
        const parts = fileUrl.split('/');
        const lastPart = parts[parts.length - 1];
        const publicIdWithFolder = parts.slice(parts.indexOf('upload') + 2).join('/').split('.')[0];
        return publicIdWithFolder || lastPart.split('.')[0];
    } catch (error) {
        console.error('File key extraction error:', error);
        return null;
    }
};
