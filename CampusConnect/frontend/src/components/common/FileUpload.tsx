import { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils'; // Adjust based on your project structure

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    error?: string;
    description?: string;
}

const FileUpload = ({
    onFileSelect,
    onFileRemove,
    label = "Upload File",
    accept = ".pdf,.doc,.docx",
    maxSizeMB = 5,
    error: externalError,
    description
}: FileUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file: File): boolean => {
        setLocalError(null);

        // Check size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setLocalError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        // Check type (extension)
        // Simple check, robust check done by accept attribute on input usually
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const uploadedFile = e.dataTransfer.files[0];
            if (validateFile(uploadedFile)) {
                setFile(uploadedFile);
                onFileSelect(uploadedFile);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0];
            if (validateFile(uploadedFile)) {
                setFile(uploadedFile);
                onFileSelect(uploadedFile);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        if (onFileRemove) {
            onFileRemove();
        }
    };

    const triggerSelect = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full space-y-2">
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}

            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-colors",
                    dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 bg-muted/50",
                    (localError || externalError) ? "border-destructive/50 bg-destructive/5" : "",
                    "cursor-pointer hover:bg-muted/70"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerSelect}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {file ? (
                    <div className="flex items-center gap-4 p-4 w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={removeFile}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {description || `SVG, PNG, JPG or PDF (MAX. ${maxSizeMB}MB)`}
                        </p>
                    </div>
                )}
            </div>

            {(localError || externalError) && (
                <p className="text-sm font-medium text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {localError || externalError}
                </p>
            )}
        </div>
    );
};

export default FileUpload;
