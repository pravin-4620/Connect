/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'; // Assumed exists
import { Checkbox } from '../../components/ui/checkbox';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Search, Save } from 'lucide-react';

interface MappedUser {
    id: string; // Student/Mentor Profile ID
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    mentorId?: string | null;
    chiefMentorId?: string | null;
    placementOfficerId?: string | null;
}

const AdminMappings = () => {
    const [students, setStudents] = useState<MappedUser[]>([]);
    const [mentors, setMentors] = useState<MappedUser[]>([]);
    const [chiefMentors, setChiefMentors] = useState<MappedUser[]>([]);
    const [officers, setOfficers] = useState<MappedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [changes, setChanges] = useState<{ [key: string]: { mentorId?: string, chiefMentorId?: string, officerId?: string } }>({});

    // Bulk Selection State
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [bulkMentorId, setBulkMentorId] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getUsers();
            const allUsers: any[] = res.data.data?.users || res.data.users || [];

            // Map Students
            const studentList = allUsers
                .filter(u => u.role === 'STUDENT' && u.student)
                .map(u => ({
                    id: u.student?.id || '',
                    userId: u.id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    role: 'STUDENT',
                    mentorId: u.student?.mentorId,
                    chiefMentorId: u.student?.chiefMentorId,
                    placementOfficerId: u.student?.placementOfficerId
                })).filter(s => s.id);
            setStudents(studentList);

            // Map Mentors
            const mentorList = allUsers
                .filter(u => u.role === 'MENTOR' && u.mentor)
                .map(u => ({
                    id: u.mentor?.id || '',
                    userId: u.id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    role: u.role,
                    chiefMentorId: u.mentor?.chiefMentorId // Added
                })).filter(m => m.id);
            setMentors(mentorList);

            // Map Chief Mentors
            const chiefList = allUsers
                .filter(u => u.role === 'CHIEF_MENTOR' && u.mentor)
                .map(u => ({
                    id: u.mentor?.id || '',
                    userId: u.id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    role: u.role
                })).filter(m => m.id);
            setChiefMentors(chiefList);

            // Map Officers
            const officerList = allUsers
                .filter(u => u.role === 'PLACEMENT_OFFICER' && u.placementOfficer)
                .map(u => ({
                    id: u.placementOfficer?.id || '',
                    userId: u.id,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    role: 'PLACEMENT_OFFICER'
                })).filter(o => o.id);
            setOfficers(officerList);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id: string, type: 'mentor' | 'chief' | 'officer', value: string) => {
        setChanges(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type === 'mentor' ? 'mentorId' : type === 'chief' ? 'chiefMentorId' : 'officerId']: value
            }
        }));
    };

    const handleSave = async (id: string, type: 'STUDENT' | 'MENTOR') => {
        const change = changes[id];
        if (!change) return;

        try {
            if (type === 'STUDENT') {
                await adminAPI.createMapping({
                    studentId: id,
                    mentorId: change.mentorId,
                    chiefMentorId: change.chiefMentorId,
                    placementOfficerId: change.officerId
                });
                // Update local state for Student
                setStudents(prev => prev.map(s =>
                    s.id === id ? { ...s, ...change } : s
                ));
            } else {
                // MENTOR Mapping
                await adminAPI.createMentorMapping({
                    mentorId: id,
                    chiefMentorId: change.chiefMentorId === 'none' ? '' : change.chiefMentorId
                });
                // Update local state for Mentor
                setMentors(prev => prev.map(m =>
                    m.id === id ? { ...m, ...change } : m
                ));
            }

            toast.success("Mapping updated");

            // Clear change
            const newChanges = { ...changes };
            delete newChanges[id];
            setChanges(newChanges);

        } catch (error) {
            console.error(error);
            toast.error("Failed to update mapping");
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        }
    };

    const handleBulkAssign = async () => {
        if (!bulkMentorId) {
            toast.error("Please select a mentor first");
            return;
        }

        try {
            const assignments = selectedStudents.map(studentId => ({
                studentId,
                mentorId: bulkMentorId
            }));

            await adminAPI.bulkAssignMentors(assignments);
            toast.success(`Assigned ${assignments.length} students to mentor`);

            // Update local state
            setStudents(prev => prev.map(s =>
                selectedStudents.includes(s.id) ? { ...s, mentorId: bulkMentorId } : s
            ));

            setSelectedStudents([]);
            setBulkMentorId('');

        } catch (error) {
            console.error(error);
            toast.error("Failed to bulk assign");
        }
    };

    const filteredStudents = students.filter(s =>
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMentors = mentors.filter(m =>
        m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mappings</h1>
                <p className="text-muted-foreground">Assign Mentors, Chief Mentors, and Officers</p>
            </div>

            <Tabs defaultValue="students" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="students">Student Mappings</TabsTrigger>
                    <TabsTrigger value="mentors">Mentor Mappings</TabsTrigger>
                </TabsList>

                {/* STUDENTS TAB */}
                <TabsContent value="students" className="space-y-4">
                    {/* Bulk Actions Panel */}
                    {selectedStudents.length > 0 && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">{selectedStudents.length} students selected</span>
                                    <div className="flex items-center gap-2">
                                        <Select value={bulkMentorId} onValueChange={setBulkMentorId}>
                                            <SelectTrigger className="w-[200px] bg-background">
                                                <SelectValue placeholder="Select Mentor for All" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mentors.map(m => (
                                                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleBulkAssign}>
                                            Assign to Selected
                                        </Button>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedStudents([])}>Cancel</Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <CardTitle>Students ({filteredStudents.length})</CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                />
                                            </TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Mentor</TableHead>
                                            <TableHead>Chief Mentor</TableHead>
                                            <TableHead>Placement Officer</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.map(student => {
                                            const pendingChange = changes[student.id];
                                            const currentMentor = pendingChange?.mentorId || student.mentorId;
                                            const currentOfficer = pendingChange?.officerId || student.placementOfficerId;
                                            const currentChief = pendingChange?.chiefMentorId || student.chiefMentorId;
                                            const hasChanges = !!pendingChange;

                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedStudents.includes(student.id)}
                                                            onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div>{student.firstName} {student.lastName}</div>
                                                        <div className="text-xs text-muted-foreground">{student.email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={currentMentor || undefined}
                                                            onValueChange={(val) => handleChange(student.id, 'mentor', val)}
                                                        >
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="Assign Mentor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mentors.map(m => (
                                                                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={currentChief || undefined}
                                                            onValueChange={(val) => handleChange(student.id, 'chief', val)}
                                                        >
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="Assign Chief" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {chiefMentors.map(m => (
                                                                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={currentOfficer || undefined}
                                                            onValueChange={(val) => handleChange(student.id, 'officer', val)}
                                                        >
                                                            <SelectTrigger className="w-[200px]">
                                                                <SelectValue placeholder="Assign Officer" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {officers.map(o => (
                                                                    <SelectItem key={o.id} value={o.id}>{o.firstName} {o.lastName}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            disabled={!hasChanges}
                                                            onClick={() => handleSave(student.id, 'STUDENT')}
                                                            className={hasChanges ? 'animated-pulse' : ''}
                                                        >
                                                            <Save className="mr-2 h-4 w-4" /> Save
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MENTORS TAB */}
                <TabsContent value="mentors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentor Mappings ({filteredMentors.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mentor</TableHead>
                                            <TableHead>Chief Mentor</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMentors.map(mentor => {
                                            const pendingChange = changes[mentor.id];
                                            const currentChief = pendingChange?.chiefMentorId || mentor.chiefMentorId;
                                            const hasChanges = !!pendingChange;

                                            return (
                                                <TableRow key={mentor.id}>
                                                    <TableCell className="font-medium">
                                                        <div>{mentor.firstName} {mentor.lastName}</div>
                                                        <div className="text-xs text-muted-foreground">{mentor.email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={currentChief || undefined}
                                                            onValueChange={(val) => handleChange(mentor.id, 'chief', val)}
                                                        >
                                                            <SelectTrigger className="w-[300px]">
                                                                <SelectValue placeholder="Assign Chief Mentor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {chiefMentors.map(cm => (
                                                                    <SelectItem key={cm.id} value={cm.id}>{cm.firstName} {cm.lastName}</SelectItem>
                                                                ))}
                                                                {/* Option to clear chief mentor? */}
                                                                <SelectItem value="none">None</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            disabled={!hasChanges}
                                                            onClick={() => handleSave(mentor.id, 'MENTOR')}
                                                            className={hasChanges ? 'animated-pulse' : ''}
                                                        >
                                                            <Save className="mr-2 h-4 w-4" /> Save
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminMappings;
