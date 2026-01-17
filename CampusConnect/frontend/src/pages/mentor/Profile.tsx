/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const MentorProfile = () => {
    const { user, login } = useAuth(); // login used to update context
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial values from auth context
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            department: user?.mentor?.department || '',
            specialization: user?.mentor?.specialization || '',
            experienceYears: user?.mentor?.experienceYears || ''
        }
    });

    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            await mentorAPI.updateProfile(data);

            toast.success("Profile updated successfully");
            setIsEditing(false);

            // Update local user context if needed (partial)
            if (user) {
                login({
                    ...user,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    mentor: {
                        ...user.mentor,
                        specialization: data.specialization,
                        experienceYears: data.experienceYears
                    }
                } as any);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Your basic account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.profilePicture} />
                                <AvatarFallback className="text-2xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            {!isEditing && (
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                                    <p className="text-muted-foreground">{user.email}</p>
                                    <p className="text-sm font-medium mt-1">{user.mentor?.department}</p>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" {...register('firstName', { required: true })} />
                                        {errors.firstName && <span className="text-red-500 text-xs">Required</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" {...register('lastName', { required: true })} />
                                        {errors.lastName && <span className="text-red-500 text-xs">Required</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...register('phone')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" {...register('department')} disabled /> {/* Usually read-only */}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialization">Specialization</Label>
                                    <Input id="specialization" {...register('specialization')} placeholder="e.g. AI/ML" />
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block">Phone</span>
                                        <span className="font-medium">{user.phone || 'Not set'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Role</span>
                                        <span className="font-medium">{user.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Specialization</span>
                                        <span className="font-medium">{user.mentor?.specialization || 'Not set'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Experience</span>
                                        <span className="font-medium">{user.mentor?.experienceYears || 0} Years</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit" form="profile-form" disabled={saving}>
                                    {saving ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : null} Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default MentorProfile;
