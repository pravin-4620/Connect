/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { placementAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Plus, Building2, Briefcase, IndianRupee, Users, Search, Check, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const PlacementDrives = () => {
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDrive, setSelectedDrive] = useState<any>(null);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getDrives();
            if (res.data?.success) {
                setDrives(res.data.data.placements);
            }
        } catch (error) {
            console.error('Failed to fetch drives', error);
            toast.error("Failed to load placement drives");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId: string, status: string) => {
        try {
            await placementAPI.updateApplicationStatus(applicationId, status);
            toast.success(`Application ${status.toLowerCase()}`);

            // Update local state deeply
            setDrives(prev => prev.map(d => {
                if (selectedDrive && d.id === selectedDrive.id) {
                    const updatedApps = d.applications.map((app: any) =>
                        app.id === applicationId ? { ...app, status } : app
                    );
                    return { ...d, applications: updatedApps };
                }
                return d;
            }));

            // Also update selected drive view
            setSelectedDrive((prev: any) => {
                if (!prev) return null;
                return {
                    ...prev,
                    applications: prev.applications.map((app: any) =>
                        app.id === applicationId ? { ...app, status } : app
                    )
                };
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                companyName: data.companyName,
                jobRole: data.jobRole,
                description: data.description,
                package: parseFloat(data.packageLPA),
                driveDate: new Date(data.driveDate).toISOString(),
                applicationDeadline: new Date(data.deadline).toISOString(),
                eligibilityCriteria: {
                    minCGPA: parseFloat(data.eligibility) || 0,
                    allowedYears: [3, 4],
                    departments: [],
                    skills: []
                }
            };

            await placementAPI.createDrive(payload);
            toast.success("Drive created successfully");
            fetchDrives();
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create drive");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this drive?")) return;
        try {
            await placementAPI.deleteDrive(id);
            toast.success("Drive deleted");
            setDrives(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete drive");
        }
    };

    const filteredDrives = drives.filter(d =>
        d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flax-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Placement Drives</h1>
                    <p className="text-muted-foreground">Manage active and upcoming recruitment processes</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search company or role..."
                            className="pl-8 w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Drive
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDrives.map(drive => (
                    <Card key={drive.id} className="relative flex flex-col">
                        <div className={`absolute top-0 right-0 p-4`}>
                            <Badge variant={new Date(drive.applicationDeadline) > new Date() ? 'default' : 'secondary'}>
                                {new Date(drive.applicationDeadline) > new Date() ? 'Open' : 'Closed'}
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Building2 className="h-5 w-5 text-primary" />
                                {drive.companyName}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 font-medium">
                                <Briefcase className="h-3 w-3" /> {drive.jobRole}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                    <IndianRupee className="h-3 w-3" /> {drive.package} LPA
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3 w-3" /> {drive.applications?.length || 0} Applicants
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {drive.description}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                                <div>
                                    <span className="block font-semibold">Eligibility</span>
                                    CGPA: {drive.eligibilityCriteria?.minCGPA || 'N/A'}
                                </div>
                                <div className="text-right">
                                    <span className="block font-semibold">Deadline</span>
                                    {format(new Date(drive.applicationDeadline), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setSelectedDrive(drive)}>View Applicants</Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(drive.id, e)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Drive</DialogTitle>
                        <DialogDescription>Enter the details for the new recruitment drive.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" {...register('companyName', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobRole">Job Role</Label>
                                <Input id="jobRole" {...register('jobRole', { required: true })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="packageLPA">Package (LPA)</Label>
                                <Input id="packageLPA" placeholder="e.g. 12 LPA" {...register('packageLPA', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eligibility">Eligibility Criteria</Label>
                                <Input id="eligibility" placeholder="e.g. 7.0+ CGPA, All Branches" {...register('eligibility', { required: true })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="driveDate">Drive Date</Label>
                                <Input id="driveDate" type="date" {...register('driveDate', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline">Application Deadline</Label>
                                <Input id="deadline" type="date" {...register('deadline', { required: true })} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Launch Drive
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Applicants Dialog */}
            <Dialog open={!!selectedDrive} onOpenChange={(open) => !open && setSelectedDrive(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Applicants for {selectedDrive?.companyName}</DialogTitle>
                        <DialogDescription>
                            {selectedDrive?.jobRole} - {selectedDrive?.applications?.length || 0} Applicants
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-md border mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Roll Number</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>CGPA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!selectedDrive?.applications || selectedDrive.applications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No applications received yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    selectedDrive.applications.map((app: any) => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">
                                                {app.student?.user?.firstName} {app.student?.user?.lastName}
                                            </TableCell>
                                            <TableCell>{app.student?.rollNumber}</TableCell>
                                            <TableCell>{app.student?.department}</TableCell>
                                            <TableCell>{app.student?.cgpa}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        app.status === 'APPROVED' ? 'default' :
                                                            app.status === 'REJECTED' ? 'destructive' : 'secondary'
                                                    }
                                                    className={app.status === 'APPROVED' ? 'bg-green-600' : ''}
                                                >
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {app.status === 'APPLIED' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                            onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default PlacementDrives;
