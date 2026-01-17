import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const LoadingSpinner = ({ size = "md", className, text, fullScreen = false }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const content = (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
            {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingSpinner;
