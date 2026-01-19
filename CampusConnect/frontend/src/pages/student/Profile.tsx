import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema } from '../../utils/validators';
import { studentAPI } from '../../services/api';
import { uploadService } from '../../services/upload';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, X, Save, Linkedin, Github, Code, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { z } from 'zod';
import FileUpload from '../../components/common/FileUpload';
import { useQuery } from '../../hooks/useQuery';
import { getFullImageUrl } from '../../utils/fileUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

type ProfileFormData = z.infer<typeof userProfileSchema>;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);

    // Data Fetching for Performance
    const { data: attendanceResp } = useQuery<any>(() => studentAPI.getAttendance());
    const { data: assignmentsResp } = useQuery<any>(() => studentAPI.getAssignments({ status: 'submitted' }));
    const { data: testsResp } = useQuery<any>(() => studentAPI.getSkillsTests());

    const attendanceStats = attendanceResp?.stats;
    const assignments = assignmentsResp?.assignments || [];
    const tests = testsResp?.tests || [];

    // Skills management
    const [skillsList, setSkillsList] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const { register, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<ProfileFormData>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            department: '',
            skills: '',
            linkedInUrl: '',
            githubUrl: '',
            leetcodeUrl: '',
            about: ''
        }
    });

    const { loading } = useQuery<any>(() => studentAPI.getProfile(), {
        dependencies: [user],
        onSuccess: (response) => {
            const data = response.student;
            if (data) {
                // Skills
                let loadedSkills: string[] = [];
                if (Array.isArray(data.skills)) {
                    loadedSkills = data.skills as string[];
                } else if (typeof data.skills === 'string') {
                    loadedSkills = (data.skills as string).split(',').map(s => s.trim()).filter(Boolean);
                }

                // Profile Pic
                if (data.user?.profilePicture) {
                    setProfilePicUrl(data.user.profilePicture);
                }

                reset({
                    firstName: data.user?.firstName || '',
                    lastName: data.user?.lastName || '',
                    phone: data.user?.phone || '',
                    department: data.department || '',
                    skills: loadedSkills.join(', '),
                    linkedInUrl: data.linkedInUrl || '',
                    githubUrl: data.githubUrl || '',
                    leetcodeUrl: data.leetcodeUrl || '',
                    about: data.about || ''
                });

                setSkillsList(loadedSkills);

                if (data.resumeUrl) {
                    setResumeUrl(data.resumeUrl);
                }
            }
        },
        onError: () => {
            toast.error("Failed to load profile data");
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
            const url = await uploadService.uploadResume(file, (progress) => console.log(progress));
            setResumeUrl(url);
            toast.success("Resume uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if already set (though UI should prevent it)
        if (profilePicUrl && user?.profilePicture) {
            toast.error("Profile picture cannot be changed once set.");
            return;
        }

        setUploadingPic(true);
        try {
            // Re-using resume upload logic or create image upload?
            // Assuming uploadService handles generic file upload or we use commonAPI
            const formData = new FormData();
            formData.append('file', file);
            // We'll use the generic upload endpoint
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setProfilePicUrl(data.data.url);
                updateUser({ profilePicture: data.data.url });
                toast.success("Image uploaded. You may need to click Save to persist other changes.");
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
        } finally {
            setUploadingPic(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            await studentAPI.updateProfile({
                ...data,
                skills: skillsList,
                resumeUrl,
                profilePicture: profilePicUrl
            });
            updateUser({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || undefined
            });
            toast.success("Profile updated successfully");
            // Ideally trigger a user refresh
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header / Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={getFullImageUrl(profilePicUrl || user?.profilePicture)} alt="Profile" className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                    </Avatar>

                    {!user?.profilePicture && !profilePicUrl && (
                        <div className="absolute bottom-0 right-0">
                            <Label htmlFor="profile-pic" className="cursor-pointer">
                                <div className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg">
                                    {uploadingPic ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                </div>
                            </Label>
                            <Input
                                id="profile-pic"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePicUpload}
                                disabled={uploadingPic}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">{user?.firstName} {user?.lastName}</h1>
                    <div className="flex flex-wrap gap-2 text-muted-foreground">
                        <Badge variant="outline" className="text-sm">{user?.role.replace('_', ' ')}</Badge>
                        <span className="flex items-center gap-1">• {user?.email}</span>
                        {user?.student?.department && <span>• {user.student.department}</span>}
                    </div>
                    <p className="max-w-xl text-muted-foreground text-sm pt-2">
                        {watch('about') || "No bio added yet."}
                    </p>
                </div>

                <Button onClick={handleSubmit(onSubmit)} disabled={isSaving} size="lg" className="shrink-0">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Left Column: Personal info & Socials */}
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Details</CardTitle>
                                <CardDescription>Your contact and academic information</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input {...register('firstName')} />
                                    {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input {...register('lastName')} />
                                    {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input {...register('phone')} placeholder="+91..." />
                                    {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input {...register('department')} disabled className="bg-muted" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>About Me</Label>
                                    <Textarea
                                        {...register('about')}
                                        placeholder="Brief introduction about yourself..."
                                        className="resize-none h-24"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Social Profiles</CardTitle>
                                <CardDescription>Connect your professional presence</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Linkedin className="h-5 w-5 text-blue-600 shrink-0" />
                                    <Input {...register('linkedInUrl')} placeholder="LinkedIn URL" />
                                </div>
                                {errors.linkedInUrl && <span className="text-xs text-destructive ml-7">{errors.linkedInUrl.message}</span>}

                                <div className="flex items-center gap-2">
                                    <Github className="h-5 w-5 shrink-0" />
                                    <Input {...register('githubUrl')} placeholder="GitHub URL" />
                                </div>
                                {errors.githubUrl && <span className="text-xs text-destructive ml-7">{errors.githubUrl.message}</span>}

                                <div className="flex items-center gap-2">
                                    <Code className="h-5 w-5 text-yellow-600 shrink-0" />
                                    <Input {...register('leetcodeUrl')} placeholder="LeetCode/HackerRank URL" />
                                </div>
                                {errors.leetcodeUrl && <span className="text-xs text-destructive ml-7">{errors.leetcodeUrl.message}</span>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Skills & Resume */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resume</CardTitle>
                                <CardDescription>Manage your CV</CardDescription>
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
                                <CardDescription>Add your technical skills</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        placeholder="Add skill..."
                                    />
                                    <Button type="button" onClick={handleAddSkill} size="icon">
                                        <Upload className="h-4 w-4 rotate-90" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:text-destructive focus:outline-none"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {skillsList.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>

            {/* Academic Performance Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Overview</CardTitle>
                        <CardDescription>Overall attendance percentage</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                        {attendanceStats ? (
                            <div className="w-full h-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Present', value: attendanceStats.present },
                                                { name: 'Absent', value: attendanceStats.absent },
                                                { name: 'On Duty', value: attendanceStats.od },
                                                ...(attendanceStats.leave ? [{ name: 'Leave', value: attendanceStats.leave }] : [])
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#22c55e" />
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#eab308" />
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                    <div className="text-3xl font-bold">{attendanceStats.percentage?.toFixed(1)}%</div>
                                    <div className="text-xs text-muted-foreground">Overall</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No attendance data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Grades & Assessments</CardTitle>
                        <CardDescription>Recent performance in assignments and tests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="assignments" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                <TabsTrigger value="tests">Skills Tests</TabsTrigger>
                            </TabsList>
                            <TabsContent value="assignments" className="mt-4 space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                {assignments.length > 0 ? (
                                    assignments.map((assignment: any) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{assignment.title}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={assignment.submissions?.[0]?.grade >= 50 ? 'secondary' : 'destructive'}>
                                                    {assignment.submissions?.[0]?.grade ?? 'N/A'} / 100
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No graded assignments found</p>
                                )}
                            </TabsContent>
                            <TabsContent value="tests" className="mt-4 space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                {tests.filter((t: any) => t.status === 'COMPLETED' || t.attempts?.length > 0).length > 0 ? (
                                    tests.filter((t: any) => t.status === 'COMPLETED' || t.attempts?.length > 0).map((test: any) => (
                                        <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{test.title}</p>
                                                <p className="text-xs text-muted-foreground">{test.attempts?.[0]?.attemptedAt ? new Date(test.attempts[0].attemptedAt).toLocaleDateString() : 'Completed'}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="bg-primary/5">
                                                    {test.score ?? test.attempts?.[0]?.score ?? 0} / {test.totalMarks}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No completed tests found</p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
