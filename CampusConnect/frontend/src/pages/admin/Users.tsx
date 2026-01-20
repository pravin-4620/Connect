/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Search, Plus, Trash2, Edit, Shield, Ban, Download } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: currentUser } = useAuth();

    // Server-side filters
    const [roleFilter, setRoleFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    const [createRole, setCreateRole] = useState('STUDENT');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [departments, setDepartments] = useState<string[]>(['CSE', 'ECE', 'MECH', 'CIVIL', 'IT']);
    const [credentials, setCredentials] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Debounced Fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [roleFilter, deptFilter, yearFilter, searchQuery]);

    const fetchDepartments = async () => {
        try {
            const res = await adminAPI.getSettings();
            if (res.data?.success && res.data.data.settings?.departments) {
                const s = res.data.data.settings;
                const fetchedDepts = Array.isArray(s.departments) ? s.departments :
                    (s.departments ? JSON.parse(s.departments) : []);
                if (fetchedDepts.length > 0) setDepartments(fetchedDepts);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (roleFilter !== 'all') params.role = roleFilter;
            if (deptFilter !== 'all') params.department = deptFilter;
            if (yearFilter !== 'all') params.year = yearFilter;
            if (searchQuery) params.search = searchQuery;

            const res = await adminAPI.getUsers(params);
            const list = Array.isArray(res.data.data?.users) ? res.data.data.users : [];
            setUsers(list);
        } catch (error) {
            console.error(error);
            setUsers([]);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOpen = () => {
        setSelectedUser(null);
        reset();
        setCreateRole('STUDENT');
        setValue('role', 'STUDENT');
        setIsCreateOpen(true);
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setCreateRole(user.role);
        setValue('firstName', user.firstName);
        setValue('lastName', user.lastName);
        setValue('email', user.email);
        setValue('role', user.role);
        setValue('phone', user.phone);

        if (user.role === 'STUDENT' && user.student) {
            setValue('rollNumber', user.student.rollNumber);
            setValue('year', user.student.year);
            setValue('department', user.student.department);
        } else if ((user.role === 'MENTOR' || user.role === 'CHIEF_MENTOR') && user.mentor) {
            setValue('department', user.mentor.department);
            setValue('specialization', user.mentor.specialization);
            setValue('experienceYears', user.mentor.experienceYears);
        } else if (user.role === 'PLACEMENT_OFFICER' && user.placementOfficer) {
            setValue('department', user.placementOfficer.department);
            setValue('designation', user.placementOfficer.designation);
        }

        setIsCreateOpen(true);
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (selectedUser) {
                await adminAPI.updateUser(selectedUser.id, data);
                toast.success("User updated successfully");
                fetchUsers();
                setIsCreateOpen(false);
            } else {
                const res = await adminAPI.createUser(data);
                toast.success("User created successfully");
                if (res.data.data?.credentials) {
                    setCredentials(res.data.data.credentials);
                }
                fetchUsers();
                setIsCreateOpen(false);
            }
            reset();
            setSelectedUser(null);
        } catch (error) {
            console.error(error);
            toast.error(selectedUser ? "Failed to update user" : "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminAPI.deleteUser(id);
            toast.success("User deleted");
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        }
    };

    const handleBlock = async (user: any) => {
        const isBlocked = !user.isBlocked;
        if (!confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) return;
        try {
            await adminAPI.toggleBlockUser(user.id, isBlocked);
            toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'}`);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked } : u));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleExport = async () => {
        setDownloading(true);
        try {
            const res = await adminAPI.exportUsersExcel();
            // Create blob link to download
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            toast.error("Failed to export users");
        } finally {
            setDownloading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return <Badge variant="destructive">Admin</Badge>;
            case 'SUB_ADMIN': return <Badge variant="destructive" className="bg-rose-600 hover:bg-rose-700">Sub Admin</Badge>;
            case 'CHIEF_MENTOR': return <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">Chief Mentor</Badge>;
            case 'MENTOR': return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Mentor</Badge>;
            case 'PLACEMENT_OFFICER': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Placement</Badge>;
            case 'STUDENT': return <Badge variant="outline">Student</Badge>;
            default: return <Badge variant="outline">{role.replace('_', ' ')}</Badge>;
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users, roles, and access.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={downloading}>
                        <Download className="mr-2 h-4 w-4" /> {downloading ? 'Exporting...' : 'Export Excel'}
                    </Button>
                    <Button onClick={handleCreateOpen}>
                        <Plus className="mr-2 h-4 w-4" /> Create User
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle>Total Users: {users.length}</CardTitle>
                        <div className="flex gap-2 w-full md:w-auto flex-wrap">
                            <div className="relative w-full md:w-48">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                    <SelectItem value="MENTOR">Mentor</SelectItem>
                                    <SelectItem value="PLACEMENT_OFFICER">Placement</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="SUB_ADMIN">Sub Admin</SelectItem>
                                    <SelectItem value="CHIEF_MENTOR">Chief Mentor</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={deptFilter} onValueChange={setDeptFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Dept" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Depts</SelectItem>
                                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {[1, 2, 3, 4].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className={user.isBlocked ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", user.isBlocked ? "bg-red-100 dark:bg-red-900" : "bg-muted")}>
                                                        {user.isBlocked ? <Ban className="h-4 w-4 text-red-600" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{user.firstName} {user.lastName}</div>
                                                        {user.student && <div className="text-xs text-muted-foreground">{user.student.department} - Year {user.student.year}</div>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                {user.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleBlock(user)} title={user.isBlocked ? "Unblock" : "Block"}>
                                                        {user.isBlocked ? <Shield className="h-4 w-4 text-green-600" /> : <Ban className="h-4 w-4 text-red-600" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} disabled={currentUser?.role !== 'ADMIN' && (user.role === 'ADMIN' || user.role === 'SUB_ADMIN')}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {currentUser?.role === 'ADMIN' && (
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                        <DialogDescription>{selectedUser ? 'Update user details.' : 'Add a new user to the system.'}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" {...register('firstName', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" {...register('lastName', { required: true })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email', { required: true })} disabled={!!selectedUser} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                onValueChange={(val) => {
                                    setValue('role', val);
                                    setCreateRole(val);
                                }}
                                defaultValue="STUDENT"
                                value={createRole}
                                disabled={!!selectedUser}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                    <SelectItem value="MENTOR">Mentor</SelectItem>
                                    <SelectItem value="PLACEMENT_OFFICER">Placement Officer</SelectItem>

                                    {currentUser?.role === 'ADMIN' && (
                                        <>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="SUB_ADMIN">Sub Admin</SelectItem>
                                        </>
                                    )}
                                    <SelectItem value="CHIEF_MENTOR">Chief Mentor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {createRole === 'STUDENT' && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rollNumber">Roll Number</Label>
                                        <Input id="rollNumber" {...register('rollNumber', { required: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year</Label>
                                        <Input id="year" type="number" min="1" max="4" {...register('year', { required: true })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        onValueChange={(val) => setValue('department', val)}
                                        defaultValue={selectedUser?.student?.department}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {(createRole === 'MENTOR' || createRole === 'CHIEF_MENTOR') && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        onValueChange={(val) => setValue('department', val)}
                                        defaultValue={selectedUser?.mentor?.department}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="specialization">Specialization</Label>
                                        <Input id="specialization" {...register('specialization')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="experienceYears">Experience (Years)</Label>
                                        <Input id="experienceYears" type="number" {...register('experienceYears')} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {createRole === 'PLACEMENT_OFFICER' && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        onValueChange={(val) => setValue('department', val)}
                                        defaultValue={selectedUser?.placementOfficer?.department}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input id="designation" {...register('designation')} />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                {selectedUser ? 'Update User' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!credentials} onOpenChange={(open) => !open && setCredentials(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User Created Successfully</DialogTitle>
                        <DialogDescription>
                            Please copy these credentials. The password will not be shown again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 p-4 border rounded-md bg-muted">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="font-medium">Email:</span>
                            <span className="col-span-2">{credentials?.email}</span>
                            <span className="font-medium">Password:</span>
                            <span className="col-span-2 font-mono bg-background px-2 rounded select-all">{credentials?.password}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCredentials(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;
