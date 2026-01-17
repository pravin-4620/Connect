
import api from './api';
import { validateFileSize } from '../utils/fileUtils';

export const uploadService = {
    uploadResume: async (file: File, onProgress?: (percent: number) => void) => {
        if (!validateFileSize(file, 5)) {
            throw new Error('Resume file size exceeds 5MB limit');
        }
        const formData = new FormData();
        formData.append('resume', file);

        const response = await api.post('/student/resume/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },

    uploadAssignment: async (assignmentId: string, file: File, onProgress?: (percent: number) => void) => {
        if (!validateFileSize(file, 10)) {
            throw new Error('Assignment file size exceeds 10MB limit');
        }
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/student/assignments/${assignmentId}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },

    uploadStudyMaterial: async (data: { title: string, subject: string, year: string, file: File }, onProgress?: (percent: number) => void) => {
        if (!validateFileSize(data.file, 50)) {
            throw new Error('Study material file size exceeds 50MB limit');
        }
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('title', data.title);
        formData.append('subject', data.subject);
        formData.append('year', data.year);

        const response = await api.post('/mentor/study-materials', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    }
};
