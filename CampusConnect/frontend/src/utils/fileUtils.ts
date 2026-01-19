export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    return file.size <= maxSizeMB * 1024 * 1024;
};

export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFullImageUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;

    // Get base URL from API URL (e.g., http://localhost:5000/api -> http://localhost:5000)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};
