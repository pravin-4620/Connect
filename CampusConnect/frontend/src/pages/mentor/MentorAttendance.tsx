/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarIcon, Save } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { format } from 'date-fns';
import { Calendar } from '../../components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../components/ui/popover';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_DUTY' | 'LEAVE' | 'UNMARKED';

interface StudentAttendance {
    studentId: string;
    studentName: string;
    rollNumber: string;
    status: AttendanceStatus;
}

const MentorAttendance = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch students and their attendance for the selected date
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // We'll need a new API endpoint for this optimization later, 
                // but for now we can fetch students and then fetch their attendance for the date
                // OR we can add a 'date' param to getStudents if we modify backend.
                // Better: new endpoint `getBatchAttendance(date)`

                // For now, let's assume getBatchAttendance exists or simulated
                const response = await mentorAPI.getBatchAttendance(date.toISOString());
                if (response.data?.success) {
                    setStudents(response.data.data.attendance);
                }
            } catch (error) {
                console.error('Failed to fetch attendance', error);

                // Fallback / Mock if API not ready
                try {
                    const studentRes = await mentorAPI.getStudents();
                    const studentList = studentRes.data?.data?.students || studentRes.data?.students || [];

                    // Transform to local shape
                    const initial = studentList.map((s: any) => ({
                        studentId: s.id,
                        studentName: `${s.user.firstName} ${s.user.lastName}`,
                        rollNumber: s.rollNumber,
                        status: 'PRESENT' // Default
                    }));
                    setStudents(initial);
                } catch (e) {
                    toast.error("Failed to load students");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setStudents(prev => prev.map(s =>
            s.studentId === studentId ? { ...s, status } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await mentorAPI.markBulkAttendance({
                date: date.toISOString(),
                records: students.map(s => ({
                    studentId: s.studentId,
                    status: s.status
                }))
            });
            toast.success(`Attendance saved for ${format(date, 'MMM d, yyyy')}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case 'PRESENT': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
            case 'ABSENT': return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200';
            case 'ON_DUTY': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
            case 'LEAVE': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    const stats = {
        present: students.filter(s => s.status === 'PRESENT').length,
        absent: students.filter(s => s.status === 'ABSENT').length,
        onDuty: students.filter(s => s.status === 'ON_DUTY').length,
        leave: students.filter(s => s.status === 'LEAVE').length,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">Manage daily attendance for your batch</p>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Attendance
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-50/50 border-green-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-green-700">{stats.present}</span>
                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Present</span>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/50 border-red-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-red-700">{stats.absent}</span>
                        <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Absent</span>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-blue-700">{stats.onDuty}</span>
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">On Duty</span>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50/50 border-yellow-100">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-yellow-700">{stats.leave}</span>
                        <span className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Leave</span>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance Sheet</CardTitle>
                    <CardDescription>Mark attendance for {format(date, 'MMMM do, yyyy')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="w-[150px]">Roll Number</TableHead>
                                    <TableHead className="text-center w-[400px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.studentId}>
                                        <TableCell className="font-medium">{student.studentName}</TableCell>
                                        <TableCell>{student.rollNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                {(['PRESENT', 'ABSENT', 'ON_DUTY', 'LEAVE'] as const).map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(student.studentId, status)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-md text-xs font-bold transition-all border",
                                                            student.status === status
                                                                ? getStatusColor(status) + " ring-2 ring-offset-1 ring-primary/20"
                                                                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                                                        )}
                                                    >
                                                        {status === 'ON_DUTY' ? 'OD' : status[0]}
                                                        {student.status === status && <span className="sr-only">(Selected)</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No students found for this mentor.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MentorAttendance;
