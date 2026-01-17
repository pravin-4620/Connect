/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';

type UploadFunction<T> = (file: File, onProgress: (percent: number) => void) => Promise<T>;

export function useFileUpload<T>(uploadFn: UploadFunction<T>) {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (file: File) => {
        setIsUploading(true);
        setProgress(0);
        setError(null);
        try {
            const result = await uploadFn(file, (p) => setProgress(p));
            return result;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
            setError(errorMsg);
            throw err;
        } finally {
            setIsUploading(false);
        }
    }, [uploadFn]);

    return { upload, progress, isUploading, error, reset: () => { setProgress(0); setError(null); } };
}
