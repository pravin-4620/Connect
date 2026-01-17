/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { studentAPI } from '../../services/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { BookOpen, Download, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { useQuery } from '../../hooks/useQuery';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import type { StudyMaterial } from '../../types';

const StudyMaterials = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [subjects, setSubjects] = useState<string[]>([]);
    const { data: materials, loading } = useQuery<StudyMaterial[]>(() => studentAPI.getStudyMaterials(), {
        onSuccess: (data: any) => {
            const list = Array.isArray(data) ? data : (data.materials || []);
            const uniqueSubjects = Array.from(new Set(list.map((m: StudyMaterial) => m.subject))).sort() as string[];
            setSubjects(uniqueSubjects);
            return list;
        },
        onError: () => {
            console.error("Failed to fetch study materials");
            toast.error("Failed to load study materials");
        }
    });

    const displayMaterials = materials || [];

    const filteredMaterials = useMemo(() => {
        let result = Array.isArray(displayMaterials) ? displayMaterials : (displayMaterials as any).materials || [];

        if (selectedSubject && selectedSubject !== 'all') {
            result = result.filter((m: StudyMaterial) => m.subject === selectedSubject);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((m: StudyMaterial) =>
                m.title.toLowerCase().includes(q) ||
                m.description?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [displayMaterials, selectedSubject, searchQuery]);


    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
                    <p className="text-muted-foreground">Access course resources and lecture notes</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search materials..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMaterials.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No study materials found.</p>
                    </div>
                ) : filteredMaterials.map((material: StudyMaterial) => (
                    <Card key={material.id} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2">
                                    {material.subject}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(material.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {material.description || 'No description provided.'}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full" asChild>
                                <a href={material.fileUrl} target="_blank" rel="noreferrer" download>
                                    <Download className="mr-2 h-4 w-4" /> Download Resource
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StudyMaterials;
