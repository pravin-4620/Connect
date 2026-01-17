/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Eye, EyeOff } from 'lucide-react';

import { changePasswordSchema } from '../../utils/validators';

type PasswordValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ChangePasswordModal = ({ isOpen: externalIsOpen, onClose: externalOnClose }: ChangePasswordModalProps = {}) => {
    const { user, updateProfile } = useAuth();
    const [internalOpen, setInternalOpen] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isControlled = externalIsOpen !== undefined;
    const open = isControlled ? externalIsOpen : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (isControlled) {
            if (!newOpen && externalOnClose) externalOnClose();
        } else {
            // Internal logic: only allow closing if not first login
            if (!user?.isFirstLogin) setInternalOpen(newOpen);
        }
    };

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PasswordValues>({
        resolver: zodResolver(changePasswordSchema)
    });

    useEffect(() => {
        if (user?.isFirstLogin && !isControlled) {
            const timer = setTimeout(() => setInternalOpen(true), 0);
            return () => clearTimeout(timer);
        }
    }, [user, isControlled]);

    const onSubmit = async (data: PasswordValues) => {
        try {
            setError(null);
            await authAPI.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            if (isControlled && externalOnClose) {
                externalOnClose();
            } else {
                setInternalOpen(false);
            }
            reset();

            // Only reload if it was a forced first login, otherwise just toast success
            if (user?.isFirstLogin) {
                updateProfile({ isFirstLogin: false });
                setInternalOpen(false);
                toast.success('Password changed successfully');
            } else {
                toast.success('Password changed successfully');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => user?.isFirstLogin && !isControlled && e.preventDefault()} onEscapeKeyDown={(e) => user?.isFirstLogin && !isControlled && e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        {user?.isFirstLogin
                            ? "For security reasons, you must change your password before continuing."
                            : "Enter your current password and a new strong password."
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <div className="relative">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                className="pr-10"
                                {...register('currentPassword')}
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700">
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <div className="relative">
                            <Input
                                type={showNew ? "text" : "password"}
                                className="pr-10"
                                {...register('newPassword')}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input
                            type="password"
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Changing..." : "Change Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordModal;

