import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

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
        extensions: ['.pdf', '.ppt', '.pptx', '.zip'],
        maxSize: 50 * 1024 * 1024, // 50MB
        mimeTypes: [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip'
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
 * Generate unique filename
 */
const generateFileName = (originalName, prefix = '') => {
    const ext = path.extname(originalName);
    const uniqueId = uuidv4();
    return `${prefix}${prefix ? '-' : ''}${uniqueId}${ext}`;
};

/**
 * Upload file to S3
 */
export const uploadFile = async (file, fileType, folder = '') => {
    try {
        // Validate file
        validateFile(file, fileType);

        // Generate unique filename
        const fileName = generateFileName(file.originalname, fileType);
        const key = folder ? `${folder}/${fileName}` : fileName;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private' // Files are private by default
        });

        await s3Client.send(command);

        // Return file URL (you might want to use CloudFront URL in production)
        const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
            url: fileUrl,
            key,
            fileName,
            size: file.size,
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
 * Delete file from S3
 */
export const deleteFile = async (fileKey) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('File deletion error:', error);
        throw error;
    }
};

/**
 * Generate presigned URL for private file access
 * @param {string} fileKey - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 */
export const getPresignedUrl = async (fileKey, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return url;
    } catch (error) {
        console.error('Presigned URL generation error:', error);
        throw error;
    }
};

/**
 * Extract file key from S3 URL
 */
export const extractFileKey = (fileUrl) => {
    try {
        const url = new URL(fileUrl);
        // Remove leading slash
        return url.pathname.substring(1);
    } catch (error) {
        console.error('File key extraction error:', error);
        return null;
    }
};
