import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Lock, ShieldAlert } from 'lucide-react';
import { loginSchema } from '../../utils/validators';

type FormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: FormValues) => {
        try {
            await login(data, true); // isAdmin = true
            navigate('/admin/dashboard');
        } catch {
            // Handle error
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <Card className="w-full max-w-md border-red-900 bg-gray-950 text-white">
                <CardHeader className="text-center">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <CardTitle className="text-2xl text-red-500">Restricted Access</CardTitle>
                    <CardDescription className="text-gray-400">System Administration Only</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <div className="relative">
                                <Input
                                    {...register('email')}
                                    className="border-gray-800 bg-gray-900 text-white focus-visible:ring-red-500"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    {...register('password')}
                                    className="pl-9 border-gray-800 bg-gray-900 text-white focus-visible:ring-red-500"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" loading={isSubmitting}>
                            Authenticate
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
