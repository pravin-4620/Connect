/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { placementAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Plus, GraduationCap, Clock, Award, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';

const SkillsTests = () => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: '',
            description: '',
            durationMinutes: 60,
            totalMarks: 100,
            questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions"
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getSkillsTests();
            if (res.data?.success) {
                setTests(res.data.data.tests);
            }
        } catch (error) {
            console.error('Failed to fetch tests', error);
            toast.error("Failed to load skills tests");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await placementAPI.createSkillsTest(data);
            toast.success("Skills test created successfully");
            fetchTests();
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create test");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Skills Tests</h1>
                    <p className="text-muted-foreground">Manage technical assessments and quizzes</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Test
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tests.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No skills tests created yet.</p>
                    </div>
                ) : tests.map((test) => (
                    <Card key={test.id}>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-start justify-between">
                                <span className="truncate pr-4">{test.title}</span>
                                <Badge variant="outline">{test.questions?.length || 0} Qs</Badge>
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                                {test.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {test.durationMinutes} mins
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    {test.totalMarks} marks
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2">
                                {test.attempts?.length || 0} students attempted
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">View Results</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Skills Test</DialogTitle>
                        <DialogDescription>Design a new assessment for students.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Test Title</Label>
                                <Input id="title" {...register('title', { required: true })} placeholder="e.g. Java Basics" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...register('description', { required: true })} placeholder="Short description..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (mins)</Label>
                                <Input id="duration" type="number" {...register('durationMinutes', { required: true, min: 1 })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="marks">Total Marks</Label>
                                <Input id="marks" type="number" {...register('totalMarks', { required: true, min: 1 })} />
                            </div>
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Questions</h3>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ question: '', options: ['', '', '', ''], correctOption: 0 })}>
                                    <Plus className="mr-2 h-3 w-3" /> Add Question
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/50 relative">
                                    <div className="flex justify-between items-start">
                                        <Label className="mt-2">Question {index + 1}</Label>
                                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Input {...register(`questions.${index}.question` as const, { required: true })} placeholder="Enter question..." />

                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {[0, 1, 2, 3].map((optIndex) => (
                                            <Input
                                                key={optIndex}
                                                {...register(`questions.${index}.options.${optIndex}` as const, { required: true })}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Label className="text-xs">Correct Option (0-3):</Label>
                                        <Input
                                            type="number"
                                            className="w-20"
                                            {...register(`questions.${index}.correctOption` as const, { required: true, min: 0, max: 3 })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Create Test
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SkillsTests;
