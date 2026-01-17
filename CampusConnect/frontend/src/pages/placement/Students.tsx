/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { placementAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';

const PlacementStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getStudents();
            if (res.data?.success) {
                const rawList = res.data.data.students || [];
                const transformed = rawList.map((s: any) => {
                    const approvedApp = s.placementApplications?.find((app: any) => app.status === 'APPROVED');
                    return {
                        id: s.id,
                        name: `${s.user.firstName} ${s.user.lastName}`,
                        rollNo: s.rollNumber,
                        department: s.department,
                        cgpa: s.cgpa || 0,
                        placed: !!approvedApp,
                        company: approvedApp ? approvedApp.placement.companyName : '-',
                        email: s.user.email,
                        phone: s.user.phone,
                        skills: s.skills || []
                    };
                });
                setStudents(transformed);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = filterDepartment === 'all' || s.department === filterDepartment;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'placed' && s.placed) ||
            (filterStatus === 'unplaced' && !s.placed);

        return matchesSearch && matchesDept && matchesStatus;
    });

    const handleExport = () => {
        toast.success("Downloading student database...");
        // Mock export logic
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flax-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Database</h1>
                    <p className="text-muted-foreground">Detailed records of all eligible students</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <CardTitle>Students ({filteredStudents.length})</CardTitle>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name or roll no..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Depts</SelectItem>
                                    <SelectItem value="CSE">CSE</SelectItem>
                                    <SelectItem value="ECE">ECE</SelectItem>
                                    <SelectItem value="MECH">MECH</SelectItem>
                                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="placed">Placed</SelectItem>
                                    <SelectItem value="unplaced">Unplaced</SelectItem>
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
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Roll Number</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>CGPA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                            No students found matching filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student: any) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.rollNo}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{student.department}</Badge>
                                            </TableCell>
                                            <TableCell>{student.cgpa}</TableCell>
                                            <TableCell>
                                                <Badge variant={student.placed ? 'default' : 'destructive'} className={student.placed ? 'bg-green-600' : ''}>
                                                    {student.placed ? 'Placed' : 'Unplaced'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {student.placed ? (
                                                    <span className="font-medium flex items-center gap-1">
                                                        {student.company}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                                                    <FileSpreadsheet className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                        <DialogDescription>Detailed information for {selectedStudent?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Roll Number</span>
                                    {selectedStudent.rollNo}
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Department</span>
                                    {selectedStudent.department}
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">CGPA</span>
                                    {selectedStudent.cgpa}
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Status</span>
                                    <Badge variant={selectedStudent.placed ? 'default' : 'secondary'} className="mt-1">
                                        {selectedStudent.placed ? 'Placed' : 'Job Seeker'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <h4 className="font-medium">Contact Information</h4>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span>{selectedStudent.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span>{selectedStudent.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <h4 className="font-medium">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(selectedStudent.skills) && selectedStudent.skills.length > 0 ? (
                                        selectedStudent.skills.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant="outline">{skill}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No skills listed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlacementStudents;
