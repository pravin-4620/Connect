/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Filter, Eye, Mail, MoreHorizontal, FileText } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import type { Student } from '../../types';
import { useQuery } from '../../hooks/useQuery';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const MentorStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [newAttendance, setNewAttendance] = useState(0); // Percentage
    const [dailyStatus, setDailyStatus] = useState('PRESENT');
    const [attendanceMode, setAttendanceMode] = useState<'daily' | 'percentage'>('daily');
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();

    const { loading } = useQuery<any>(() => mentorAPI.getStudents(), {
        onSuccess: (data) => {
            const list = Array.isArray(data) ? data : (data?.data?.students || data?.students || []);
            const safeList = Array.isArray(list) ? list : [];
            setStudents(safeList);
        },
        onError: () => {
            toast.error("Failed to fetch students");
            setStudents([]);
        }
    });

    const handleUpdateAttendance = async () => {
        if (!selectedStudent) return;
        setUpdating(true);
        try {
            if (attendanceMode === 'percentage') {
                await mentorAPI.updateAttendance(selectedStudent.id, newAttendance);
                toast.success("Attendance percentage updated");
                setStudents(prev => prev.map(s =>
                    s.id === selectedStudent.id ? { ...s, attendance: newAttendance } : s
                ));
            } else {
                await mentorAPI.markDailyAttendance(selectedStudent.id, dailyStatus);
                toast.success(`Marked as ${dailyStatus}`);
            }
            setIsAttendanceOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update attendance");
        } finally {
            setUpdating(false);
        }
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        const lower = searchQuery.toLowerCase();
        return students.filter((s: any) =>
            s.user?.firstName?.toLowerCase().includes(lower) ||
            s.user?.lastName?.toLowerCase().includes(lower) ||
            (s.rollNumber && s.rollNumber.toLowerCase().includes(lower))
        );
    }, [searchQuery, students]);

    const getStatusBadge = (status: string | undefined) => {
        if (status === 'PLACED') return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Placed</Badge>;
        if (status === 'UNPLACED') return <Badge variant="secondary">Unplaced</Badge>;
        return <Badge variant="outline" className="text-muted-foreground">N/A</Badge>;
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
                    <p className="text-muted-foreground">Manage and track your mentees</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Student Directory ({filteredStudents.length})</CardTitle>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or roll no..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
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
                                    <TableHead className="text-center">Year</TableHead>
                                    <TableHead className="text-center">Attendance</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student: any) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.user?.firstName} {student.user?.lastName}
                                                <div className="text-xs text-muted-foreground">{student.user?.email}</div>
                                            </TableCell>
                                            <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                                            <TableCell>{student.department}</TableCell>
                                            <TableCell className="text-center">{student.year}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={(student.attendance || 0) >= 75 ? "outline" : "destructive"}>
                                                    {student.attendance || 0}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(student.placementStatus)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigate(`/mentor/students/${student.id}`)}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${student.user?.email}`}>
                                                            <Mail className="mr-2 h-4 w-4" /> Send Email
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Attendance Management</DialogTitle>
                        <DialogDescription>
                            Mark attendance for {selectedStudent?.user?.firstName}.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={attendanceMode} onValueChange={(v: any) => setAttendanceMode(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="daily">Daily Record</TabsTrigger>
                            <TabsTrigger value="percentage">Update Percentage</TabsTrigger>
                        </TabsList>

                        <TabsContent value="daily" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Status for Today ({new Date().toLocaleDateString()})</Label>
                                <Select value={dailyStatus} onValueChange={setDailyStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRESENT">Present</SelectItem>
                                        <SelectItem value="ABSENT">Absent</SelectItem>
                                        <SelectItem value="ON_DUTY">On Duty</SelectItem>
                                        <SelectItem value="LEAVE">Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>

                        <TabsContent value="percentage" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="attendance">Overall Percentage (%)</Label>
                                <Input
                                    id="attendance"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newAttendance}
                                    onChange={(e) => setNewAttendance(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Adjusting this manually overrides calculated values.</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateAttendance} disabled={updating}>
                            {updating ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : null} Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MentorStudents;
