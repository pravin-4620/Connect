/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarIcon, Save, Lock } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { format, isSameDay, isAfter, startOfToday, isBefore } from 'date-fns';
import { Calendar } from '../../components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../components/ui/popover';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_DUTY';

interface StudentAttendance {
    studentId: string;
    studentName: string;
    rollNumber: string;
    status: AttendanceStatus;
    isMarked?: boolean;
}

const COLORS = {
    PRESENT: '#22c55e', // green-500
    ABSENT: '#ef4444', // red-500
    ON_DUTY: '#3b82f6', // blue-500
};

const MentorAttendance = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    // Fetch students and their attendance for the selected date
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await mentorAPI.getBatchAttendance(date.toISOString());
                if (response.data?.success) {
                    const fetchedStudents = response.data.data.attendance;

                    // Filter out invalid statuses if any (like LEAVE from old data) and cast
                    const cleanedStudents = fetchedStudents.map((s: any) => ({
                        ...s,
                        status: ['PRESENT', 'ABSENT', 'ON_DUTY'].includes(s.status) ? s.status : 'PRESENT'
                    }));

                    setStudents(cleanedStudents);

                    // Determine editability
                    const today = startOfToday();
                    const isFuture = isAfter(date, today);
                    const isPast = isBefore(date, today);
                    // Check if any student is already marked (implies batch is marked)
                    const isAlreadyMarked = cleanedStudents.some((s: any) => s.isMarked);

                    // Rule: Cannot change if saved. Cannot change past/future.
                    // So only editable if Today AND Not Yet Marked.
                    if (isFuture || isPast || isAlreadyMarked) {
                        setIsEditable(false);
                    } else {
                        setIsEditable(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch attendance', error);

                // Fallback for demo/offline
                try {
                    const studentRes = await mentorAPI.getStudents();
                    const studentList = studentRes.data?.data?.students || studentRes.data?.students || [];
                    const initial = studentList.map((s: any) => ({
                        studentId: s.id,
                        studentName: `${s.user.firstName} ${s.user.lastName}`,
                        rollNumber: s.rollNumber,
                        status: 'PRESENT',
                        isMarked: false
                    }));
                    setStudents(initial);
                    setIsEditable(isSameDay(date, new Date()));
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
        if (!isEditable) return;
        setStudents(prev => prev.map(s =>
            s.studentId === studentId ? { ...s, status } : s
        ));
    };

    const handleSave = async () => {
        if (!isEditable) return;
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
            setIsEditable(false); // Lock after saving
            // Update local state to reflect 'marked'
            setStudents(prev => prev.map(s => ({ ...s, isMarked: true })));
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
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    const statsData = [
        { name: 'Present', value: students.filter(s => s.status === 'PRESENT').length, color: COLORS.PRESENT },
        { name: 'Absent', value: students.filter(s => s.status === 'ABSENT').length, color: COLORS.ABSENT },
        { name: 'On Duty', value: students.filter(s => s.status === 'ON_DUTY').length, color: COLORS.ON_DUTY },
    ].filter(s => s.value > 0);

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
                                disabled={(date) => isAfter(date, new Date())} // Optional: visual disable in calendar
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleSave} disabled={saving || !isEditable}>
                        {saving ? <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" /> :
                            !isEditable ? <Lock className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEditable ? 'Save Attendance' : 'Locked'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Donut Chart Section */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Attendance distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[300px]">
                        {statsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted-foreground text-sm">No data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>
                            {format(date, 'MMMM do, yyyy')} • {isEditable ? 'Editable' : 'Read Only'}
                        </CardDescription>
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
                                                    {(['PRESENT', 'ABSENT', 'ON_DUTY'] as const).map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(student.studentId, status)}
                                                            disabled={!isEditable}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-md text-xs font-bold transition-all border",
                                                                student.status === status
                                                                    ? getStatusColor(status) + " ring-2 ring-offset-1 ring-primary/20"
                                                                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted",
                                                                !isEditable && "opacity-50 cursor-not-allowed hover:bg-transparent"
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
        </div>
    );
};

export default MentorAttendance;
