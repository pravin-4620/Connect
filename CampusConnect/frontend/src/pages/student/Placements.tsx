import { useEffect, useState } from 'react';
import { studentAPI } from '../../services/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { toast } from 'sonner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Briefcase, DollarSign, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { PlacementDrive } from '../../types';
import { useQuery } from '../../hooks/useQuery';

const getMockDrives = (): any[] => [
    {
        id: '1',
        companyName: 'Google',
        driveDate: new Date(Date.now() + 864000000).toISOString(),
        eligibilityCriteria: { minCGPA: 8.5, allowedYears: [2024], departments: ['CSE', 'ECE'] },
        package: 3000000,
        jobRole: 'Software Engineer',
        description: 'Roles in Cloud Platform team. Problem solving skills required.',
        location: 'Bangalore',
        application: undefined
    },
    {
        id: '2',
        companyName: 'Microsoft',
        driveDate: new Date(Date.now() + 1000000000).toISOString(),
        eligibilityCriteria: { minCGPA: 8.0, allowedYears: [2024] },
        package: 4500000,
        jobRole: 'SDE II',
        description: 'Applications for Azure team.',
        location: 'Hyderabad',
        application: { status: 'PENDING' } // Mocking an application
    }
];

const StudentPlacements = () => {
    const [drives, setDrives] = useState<PlacementDrive[]>([]);
    const [filteredDrives, setFilteredDrives] = useState<PlacementDrive[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');

    const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [applying, setApplying] = useState(false);

    const { loading } = useQuery<any>(() => studentAPI.getPlacements(), {
        onSuccess: (data) => {
            const driveList = Array.isArray(data) ? data : (data?.drives || []);
            setDrives(driveList);
            setFilteredDrives(driveList);
        },
        onError: () => {
            toast.error("Failed to load placement drives");
            const mocks = getMockDrives();
            setDrives(mocks);
            setFilteredDrives(mocks);
        }
    });

    useEffect(() => {
        let result = drives;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.companyName.toLowerCase().includes(q) ||
                d.jobRole.toLowerCase().includes(q)
            );
        }

        if (sortBy === 'package') {
            result = [...result].sort((a, b) => b.package - a.package);
        } else if (sortBy === 'date') {
            result = [...result].sort((a, b) => new Date(a.driveDate).getTime() - new Date(b.driveDate).getTime());
        }

        setFilteredDrives(result);
    }, [drives, searchQuery, sortBy]);

    const handleApplyClick = (drive: PlacementDrive) => {
        setSelectedDrive(drive);
        setIsApplyOpen(true);
    };

    const handleConfirmApply = async () => {
        if (!selectedDrive) return;

        setApplying(true);
        try {
            await studentAPI.applyForPlacement(selectedDrive.id);
            toast.success(`Successfully applied to ${selectedDrive.companyName}`);

            // Update local state to show 'Applied'
            setDrives(prev => prev.map(d =>
                d.id === selectedDrive.id
                    ? { ...d, application: { id: 'temp', placementId: d.id, studentId: 'me', status: 'PENDING', appliedAt: new Date().toISOString() } }
                    : d
            ));

            setIsApplyOpen(false);
            setIsDetailOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    const openDetails = (drive: PlacementDrive) => {
        setSelectedDrive(drive);
        setIsDetailOpen(true);
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Placement Drives</h1>
                    <p className="text-muted-foreground">Explore and apply for upcoming opportunities</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search company or role..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Date (Earliest)</SelectItem>
                            <SelectItem value="package">Package (High-Low)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDrives.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No placement drives found matching your criteria.</p>
                    </div>
                ) : filteredDrives.map((drive) => {
                    const isApplied = !!drive.application;
                    return (
                        <Card key={drive.id} className="flex flex-col hover:shadow-lg transition-shadow border-l-4 border-l-primary/50">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2 bg-muted/50">
                                            {drive.jobRole}
                                        </Badge>
                                        <CardTitle className="text-xl">{drive.companyName}</CardTitle>
                                    </div>
                                    {isApplied ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Applied
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">New</Badge>
                                    )}
                                </div>
                                <CardDescription className="flex items-center mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {drive.location || 'Multiple Locations'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="font-semibold">{(drive.package / 100000).toFixed(1)} LPA</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span>{new Date(drive.driveDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {drive.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button variant="outline" className="w-full" onClick={() => openDetails(drive)}>
                                    Details
                                </Button>
                                <Button
                                    className="w-full"
                                    disabled={isApplied}
                                    onClick={() => handleApplyClick(drive)}
                                >
                                    {isApplied ? 'Pending' : 'Apply Now'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Drive Details Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl z-[100]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{selectedDrive?.companyName}</DialogTitle>
                        <DialogDescription>
                            {selectedDrive?.jobRole} • {selectedDrive && format(new Date(selectedDrive.driveDate), 'MMMM d, yyyy')}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDrive && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Package</p>
                                    <p className="text-xl font-bold">{(selectedDrive.package / 100000).toFixed(2)} LPA</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="text-xl font-bold">{selectedDrive.location || 'Multiple'}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Job Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedDrive.description || 'No description provided.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Minimum CGPA: {selectedDrive.eligibilityCriteria?.minCGPA || 'N/A'}</li>
                                    <li>Allowed Years: {selectedDrive.eligibilityCriteria?.allowedYears?.join(', ') || 'All'}</li>
                                    <li>Departments: {selectedDrive.eligibilityCriteria?.departments?.join(', ') || 'All'}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedDrive?.application ? (
                            <Button variant="secondary" disabled className="w-full">Already Applied</Button>
                        ) : (
                            <Button className="w-full" onClick={() => selectedDrive && handleApplyClick(selectedDrive)}>
                                Apply for this Role
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Apply Modal */}
            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>Confirm Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to apply for <strong>{selectedDrive?.companyName}</strong>?
                            Your resume will be shared with the recruiter.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmApply} disabled={applying}>
                            {applying && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                            Confirm Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentPlacements;
