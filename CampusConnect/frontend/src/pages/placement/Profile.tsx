/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { authAPI, placementAPI } from '../../services/api';
import { toast } from 'sonner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Building, Briefcase, Phone, Mail } from 'lucide-react';

const PlacementProfile = () => {
    const { register, handleSubmit, setValue } = useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authAPI.getProfile();
            if (res.data?.success) {
                const user = res.data.data.user;
                setValue('firstName', user.firstName);
                setValue('lastName', user.lastName);
                setValue('email', user.email);
                setValue('phone', user.phone);
                // Placement specific
                if (user.placementOfficer) {
                    setValue('department', user.placementOfficer.department);
                    setValue('designation', user.placementOfficer.designation);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            await placementAPI.updateProfile(data);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Update your contact information and role details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="firstName" className="pl-9" {...register('firstName', { required: true })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="lastName" className="pl-9" {...register('lastName', { required: true })} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" className="pl-9" {...register('email')} disabled />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="phone" className="pl-9" {...register('phone')} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <div className="relative">
                                    <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="department" className="pl-9" {...register('department')} placeholder="e.g. CSE" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="designation" className="pl-9" {...register('designation')} placeholder="e.g. Senior Placement Officer" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : null}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};
export default PlacementProfile;
