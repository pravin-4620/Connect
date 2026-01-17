import { format, formatDistanceToNow, differenceInDays, isAfter } from 'date-fns';

export const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const getRelativeTime = (date: string | Date | undefined): string => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate: string | Date): boolean => {
    return isAfter(new Date(), new Date(dueDate));
};

export const getDaysUntil = (date: string | Date): number => {
    return differenceInDays(new Date(date), new Date()); // Can be negative
};
