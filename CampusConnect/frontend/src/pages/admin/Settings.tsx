/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Download, Server, Shield, Activity, Calendar, RefreshCcw, Briefcase, Users, GraduationCap } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [newDept, setNewDept] = useState('');
    const [settings, setSettings] = useState({
        academicYear: '2025-2026',
        semester: 'ODD',
        maintenanceMode: 'false',
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPass: '',
        departments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT'],
        // Module Settings
        allowStudentProfileEdit: 'true',
        maxMentorsPerStudent: '1',
        minCgpaForPlacement: '6.0',
        allowMultipleOffers: 'false'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await adminAPI.getSettings();
            if (res.data?.success && res.data.data.settings) {
                const s = res.data.data.settings;
                const smtp = s.smtpConfig || {};
                const fetchedDepts = Array.isArray(s.departments) ? s.departments :
                    (s.departments ? JSON.parse(s.departments) : ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT']);

                setSettings(prev => ({
                    ...prev,
                    academicYear: s.academicYear || prev.academicYear,
                    semester: s.semester || prev.semester,
                    maintenanceMode: String(s.maintenanceMode) === 'true' ? 'true' : 'false',
                    smtpHost: smtp.host || s.smtpHost || '',
                    smtpPort: smtp.port || s.smtpPort || '',
                    smtpUser: smtp.user || s.smtpUser || '',
                    smtpPass: smtp.pass || s.smtpPass || '',
                    departments: fetchedDepts,
                    allowStudentProfileEdit: s.allowStudentProfileEdit || 'true',
                    maxMentorsPerStudent: s.maxMentorsPerStudent || '1',
                    minCgpaForPlacement: s.minCgpaForPlacement || '6.0',
                    allowMultipleOffers: s.allowMultipleOffers || 'false'
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAddDepartment = () => {
        if (!newDept.trim()) return;
        if (settings.departments.includes(newDept.toUpperCase())) {
            toast.error("Department already exists");
            return;
        }
        setSettings(prev => ({
            ...prev,
            departments: [...prev.departments, newDept.toUpperCase()]
        }));
        setNewDept('');
    };

    const handleRemoveDepartment = (dept: string) => {
        setSettings(prev => ({
            ...prev,
            departments: prev.departments.filter(d => d !== dept)
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                academicYear: settings.academicYear,
                semester: settings.semester,
                maintenanceMode: settings.maintenanceMode,
                smtpConfig: {
                    host: settings.smtpHost,
                    port: settings.smtpPort,
                    user: settings.smtpUser,
                    pass: settings.smtpPass
                },
                departments: settings.departments,
                allowStudentProfileEdit: settings.allowStudentProfileEdit,
                maxMentorsPerStudent: settings.maxMentorsPerStudent,
                minCgpaForPlacement: settings.minCgpaForPlacement,
                allowMultipleOffers: settings.allowMultipleOffers
            };

            await adminAPI.updateSettings(payload);
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    const handleExportUsers = async () => {
        try {
            const res = await adminAPI.exportUserData();
            const users = res.data.data.users;

            // Convert to CSV
            const headers = ['ID', 'Role', 'Email', 'First Name', 'Last Name', 'Phone', 'Details'];
            const csvRows = [headers.join(',')];

            for (const user of users) {
                let details = '';
                if (user.role === 'STUDENT' && user.student) {
                    details = `Roll: ${user.student.rollNumber} | Year: ${user.student.year} | Dept: ${user.student.department}`;
                } else if (user.role === 'MENTOR' && user.mentor) {
                    details = `Dept: ${user.mentor.department} | Exp: ${user.mentor.experienceYears}y`;
                } else if (user.role === 'PLACEMENT_OFFICER' && user.placementOfficer) {
                    details = `role: ${user.placementOfficer.designation || 'Officer'}`;
                }

                const row = [
                    user.id,
                    user.role,
                    user.email,
                    user.firstName,
                    user.lastName,
                    user.phone || '',
                    `"${details}"` // Quote details to handle commas
                ];
                csvRows.push(row.join(','));
            }

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            toast.success("Users exported as CSV");
        } catch (error) {
            console.error(error);
            toast.error("Export failed");
        }
    };

    const handleDownloadLogs = async () => {
        try {
            const res = await adminAPI.getSystemLogs();
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                JSON.stringify(res.data.data.logs, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `system_logs_${new Date().toISOString()}.json`;
            link.click();
            toast.success("Logs downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Log download failed");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />}
                    Save All Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="placements">Placements</TabsTrigger>
                    <TabsTrigger value="mentors">Mentors & Students</TabsTrigger>
                    <TabsTrigger value="data">Data & Maintenance</TabsTrigger>
                </TabsList>

                {/* GENERAL SETTINGS */}
                <TabsContent value="general" className="space-y-4 pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Academic Year</CardTitle>
                                <CardDescription>Configure current academic session</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Year</Label>
                                    <Input value={settings.academicYear} onChange={(e) => handleChange('academicYear', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Semester</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant={settings.semester === 'ODD' ? "default" : "outline"} onClick={() => handleChange('semester', 'ODD')}>Odd</Button>
                                        <Button variant={settings.semester === 'EVEN' ? "default" : "outline"} onClick={() => handleChange('semester', 'EVEN')}>Even</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Departments</CardTitle>
                                <CardDescription>Manage available departments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input placeholder="Add Dept (e.g. AI)" value={newDept} onChange={(e) => setNewDept(e.target.value)} />
                                    <Button onClick={handleAddDepartment} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {settings.departments.map(dept => (
                                        <div key={dept} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                                            {dept}
                                            <button onClick={() => handleRemoveDepartment(dept)} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> SMTP Configuration</CardTitle>
                                <CardDescription>Email settings</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2"><Label>Host</Label><Input value={settings.smtpHost} onChange={(e) => handleChange('smtpHost', e.target.value)} placeholder="smtp.gmail.com" /></div>
                                <div className="space-y-2"><Label>Port</Label><Input value={settings.smtpPort} onChange={(e) => handleChange('smtpPort', e.target.value)} placeholder="587" /></div>
                                <div className="space-y-2"><Label>User</Label><Input value={settings.smtpUser} onChange={(e) => handleChange('smtpUser', e.target.value)} placeholder="User" /></div>
                                <div className="space-y-2"><Label>Pass</Label><Input type="password" value={settings.smtpPass} onChange={(e) => handleChange('smtpPass', e.target.value)} placeholder="Password" /></div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PLACEMENTS SETTINGS */}
                <TabsContent value="placements" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Placement Configuration</CardTitle>
                            <CardDescription>Rules for placement drives</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow Multiple Offers</Label>
                                    <p className="text-sm text-muted-foreground">Can a placed student sit for another company?</p>
                                </div>
                                <Switch
                                    checked={settings.allowMultipleOffers === 'true'}
                                    onCheckedChange={(c) => handleChange('allowMultipleOffers', String(c))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Minimum CGPA for Eligibility (Default)</Label>
                                <Input type="number" step="0.1" value={settings.minCgpaForPlacement} onChange={(e) => handleChange('minCgpaForPlacement', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MENTORS & STUDENTS */}
                <TabsContent value="mentors" className="space-y-4 pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Student Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Allow Profile Editing</Label>
                                        <p className="text-sm text-muted-foreground">Students can update their own details</p>
                                    </div>
                                    <Switch
                                        checked={settings.allowStudentProfileEdit === 'true'}
                                        onCheckedChange={(c) => handleChange('allowStudentProfileEdit', String(c))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Mentor Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Max Mentors per Student</Label>
                                    <Input type="number" value={settings.maxMentorsPerStudent} onChange={(e) => handleChange('maxMentorsPerStudent', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* DATA & MAINTENANCE */}
                <TabsContent value="data" className="space-y-4 pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> System Maintenance</CardTitle>
                                <CardDescription>Control system availability</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-orange-900 dark:text-orange-200">Maintenance Mode</div>
                                        <div className="text-sm text-orange-700 dark:text-orange-300">Disable access for all non-admin users</div>
                                    </div>
                                    <Switch
                                        checked={settings.maintenanceMode === 'true'}
                                        onCheckedChange={(c) => handleChange('maintenanceMode', String(c))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Data Export</CardTitle>
                                <CardDescription>Backup and logs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full justify-start" onClick={handleExportUsers}>
                                    <Download className="mr-2 h-4 w-4" /> Export All User Data (JSON)
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={handleDownloadLogs}>
                                    <Activity className="mr-2 h-4 w-4" /> Download System Logs
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
