import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema } from '../../utils/validators';
import { studentAPI } from '../../services/api';
import { uploadService } from '../../services/upload';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { z } from 'zod';
import FileUpload from '../../components/common/FileUpload';
import { useQuery } from '../../hooks/useQuery';

type ProfileFormData = z.infer<typeof userProfileSchema>;

// Define profile data interface based on API usage
interface ProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    skills?: string;
    resumeUrl?: string;
}

const Profile = () => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [uploadingResume, setUploadingResume] = useState(false);

    // Skills management
    const [skillsList, setSkillsList] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<ProfileFormData>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            department: '',
            skills: ''
        }
    });

    const { loading } = useQuery<ProfileData>(() => studentAPI.getProfile(), {
        dependencies: [user],
        onSuccess: (data) => {
            if (data) {
                // Handle skills: Backend stores as Json (Array), but might be string in legacy
                let loadedSkills: string[] = [];
                if (Array.isArray(data.skills)) {
                    loadedSkills = data.skills as string[];
                } else if (typeof data.skills === 'string') {
                    loadedSkills = (data.skills as string).split(',').map(s => s.trim()).filter(Boolean);
                }

                reset({
                    firstName: data.firstName || user?.firstName || '',
                    lastName: data.lastName || user?.lastName || '',
                    phone: data.phone || '',
                    department: data.department || '',
                    skills: loadedSkills.join(', ') // Form uses string representation
                });

                setSkillsList(loadedSkills);

                if (data.resumeUrl) {
                    setResumeUrl(data.resumeUrl);
                }
            }
        },
        onError: () => {
            toast.error("Failed to load profile data");
            const fallbackSkills = ['React', 'TypeScript', 'Node.js'];
            reset({
                firstName: user?.firstName || 'John',
                lastName: user?.lastName || 'Doe',
                phone: '9876543210',
                department: 'Computer Science',
                skills: fallbackSkills.join(', ')
            });
            setSkillsList(fallbackSkills);
        }
    });

    const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const trimmed = skillInput.trim();
            if (trimmed && !skillsList.includes(trimmed)) {
                const newSkills = [...skillsList, trimmed];
                setSkillsList(newSkills);
                setSkillInput('');
                setValue('skills', newSkills.join(', '));
            }
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        const newSkills = skillsList.filter(s => s !== skillToRemove);
        setSkillsList(newSkills);
        setValue('skills', newSkills.join(', '));
    };

    const handleResumeUpload = async (file: File) => {
        if (!file) return;

        setUploadingResume(true);
        try {
            const url = await uploadService.uploadResume(file, (progress) => {
                console.log(`Upload progress: ${progress}%`);
            });
            setResumeUrl(url);
            toast.success("Resume uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            await studentAPI.updateProfile({
                ...data,
                skills: skillsList, // Send as Array
                resumeUrl
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={user?.profilePicture} alt="Profile" />
                    <AvatarFallback className="text-2xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
                    <p className="text-muted-foreground capitalize">{user?.role.toLowerCase().replace('_', ' ')} • {user?.email}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Details */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                            <CardDescription>Update your contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" {...register('firstName')} />
                                    {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" {...register('lastName')} />
                                    {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" {...register('phone')} placeholder="+91 9999999999" />
                                {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" {...register('department')} disabled className="bg-muted" />
                                {errors.department && <span className="text-xs text-destructive">{errors.department.message}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resume & Skills */}
                    <div className="space-y-6 md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resume</CardTitle>
                                <CardDescription>Manage your CV for placements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {resumeUrl ? (
                                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="text-sm font-medium truncate">Current Resume</p>
                                                <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline block truncate">
                                                    View / Download
                                                </a>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" type="button" onClick={() => setResumeUrl(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <FileUpload
                                            onFileSelect={handleResumeUpload}
                                            accept=".pdf,.docx,.doc"
                                            maxSizeMB={5}
                                            description="PDF or DOCX (Max 5MB)"
                                        />
                                        {uploadingResume && (
                                            <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Skills</CardTitle>
                                <CardDescription>Add technical skills for matching</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        placeholder="Add skill (e.g. React) and press Enter"
                                    />
                                    <Button type="button" onClick={handleAddSkill} size="icon">
                                        <Upload className="h-4 w-4 rotate-90" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="px-2 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="ml-2 hover:text-destructive focus:outline-none"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {skillsList.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
                                    )}
                                </div>
                                <Input type="hidden" {...register('skills')} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button type="submit" size="lg" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
