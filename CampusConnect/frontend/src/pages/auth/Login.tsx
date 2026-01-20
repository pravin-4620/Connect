/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Eye, EyeOff, Lock, Mail, GraduationCap, UserCheck, Briefcase, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { loginSchema } from '../../utils/validators';

const formSchema = loginSchema.extend({
    role: z.enum(['STUDENT', 'MENTOR', 'PLACEMENT_OFFICER']),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
    const [checkingMaintenance, setCheckingMaintenance] = useState(true);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: 'STUDENT',
        }
    });

    // Check maintenance status on component mount
    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/maintenance-status`);
                const data = await response.json();
                if (data.success && data.data.maintenanceMode) {
                    setIsMaintenanceActive(true);
                    setShowMaintenance(true);
                }
            } catch (err) {
                console.error('Failed to check maintenance status:', err);
            } finally {
                setCheckingMaintenance(false);
            }
        };
        checkMaintenance();
    }, []);

    const onSubmit = async (data: FormValues) => {
        try {
            setError(null);
            await login(data);
            switch (data.role) {
                case 'STUDENT': navigate('/student/dashboard'); break;
                case 'MENTOR': navigate('/mentor/dashboard'); break;
                case 'PLACEMENT_OFFICER': navigate('/placement/dashboard'); break;
            }
        } catch (err: any) {
            if (err?.response?.status === 503) {
                setShowMaintenance(true);
            } else {
                setError(err?.response?.data?.message || 'Invalid credentials');
            }
        }
    };

    if (checkingMaintenance) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isMaintenanceActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md shadow-lg border-amber-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-2xl text-amber-600">System Under Maintenance</CardTitle>
                        <CardDescription className="pt-2 text-base">
                            The CampusConnect platform is currently undergoing scheduled maintenance to improve your experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Students, Mentors, and Placement Officers cannot login at this time.
                            <br /><br />
                            Please check back shortly or contact your administrator for more information.
                        </p>
                        <div className="pt-4">
                            <p className="text-xs text-muted-foreground">
                                Admin access? <Link to="/admin/login" className="text-primary hover:underline font-medium">Login here</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-primary to-violet-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 ring-4 ring-white/10">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">CampusConnect</h1>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Your unified academic platform for seamless collaboration and growth.
                    </p>
                </div>

                <Card className="shadow-xl border-gray-100/50 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 dark:border-gray-800">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive flex items-center justify-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${errors.role ? 'border-destructive' : 'border-input'} has-[:checked]:bg-primary/5 has-[:checked]:border-primary`}>
                                        <input type="radio" value="STUDENT" className="sr-only" {...register('role')} />
                                        <GraduationCap className="w-6 h-6 mb-1 text-primary" />
                                        <span className="text-xs font-medium">Student</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${errors.role ? 'border-destructive' : 'border-input'} has-[:checked]:bg-primary/5 has-[:checked]:border-primary`}>
                                        <input type="radio" value="MENTOR" className="sr-only" {...register('role')} />
                                        <UserCheck className="w-6 h-6 mb-1 text-primary" />
                                        <span className="text-xs font-medium">Mentor</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${errors.role ? 'border-destructive' : 'border-input'} has-[:checked]:bg-primary/5 has-[:checked]:border-primary`}>
                                        <input type="radio" value="PLACEMENT_OFFICER" className="sr-only" {...register('role')} />
                                        <Briefcase className="w-6 h-6 mb-1 text-primary" />
                                        <span className="text-xs font-medium">Placement</span>
                                    </label>
                                </div>
                                {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        className="pl-10"
                                        placeholder="m@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Password</label>
                                    <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('password')}
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" loading={isSubmitting}>
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <div className="text-sm text-center text-muted-foreground">
                            Admin access? <Link to="/admin/login" className="text-primary hover:underline font-medium">Login here</Link>
                        </div>
                    </CardFooter>
                </Card>

                <Dialog open={showMaintenance} onOpenChange={setShowMaintenance}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="h-5 w-5" />
                                System Under Maintenance
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-base">
                                The CampusConnect platform is currently undergoing scheduled maintenance to improve your experience.
                                <br /><br />
                                Please check back shortly. Students and Faculty cannot login at this time.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end pt-2">
                            <Button onClick={() => setShowMaintenance(false)}>Close</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Login;
