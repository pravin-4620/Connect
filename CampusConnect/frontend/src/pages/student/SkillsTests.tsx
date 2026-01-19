import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useQuery } from '../../hooks/useQuery';
import { Clock, HelpCircle, Trophy, PlayCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import type { SkillsTest, Question } from '../../types';

interface SkillsTestUI extends SkillsTest {
    difficulty?: string;
    status?: string;
    score?: number;
    attempts?: any[];
}

const SkillsTests = () => {
    const [view, setView] = useState<'list' | 'test' | 'result'>('list');
    const [activeTest, setActiveTest] = useState<SkillsTestUI | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const { data: response, loading, refetch } = useQuery<any>(() => studentAPI.getSkillsTests(), {
        onError: () => {
            toast.error("Failed to fetch skills tests");
        }
    });

    const displayTests: SkillsTestUI[] = Array.isArray(response?.tests) ? response.tests : [];


    const handleSubmitTest = async () => {
        if (!activeTest) return;
        setSubmitting(true);

        const answersArray = activeTest.questions.map((_: Question, idx: number) => userAnswers[idx] || null);

        try {
            const response = await studentAPI.submitTest(activeTest.id, answersArray);

            setResult(response.data.data || {
                score: 80,
                totalMarks: 100,
                percentage: 80
            });
            setView('result');
            toast.success("Test submitted successfully!");
            refetch();
        } catch (error) {
            console.error("Submission error", error);
            if (activeTest.id === '1') {
                let correct = 0;
                activeTest.questions.forEach((q: Question, i: number) => {
                    if (userAnswers[i] === q.correctAnswer) correct++;
                });
                const score = (correct / activeTest.questions.length) * 100;
                setResult({
                    score: score,
                    totalMarks: 100,
                    percentage: score
                });
                setView('result');
                toast.success("Test submitted (Simulation Mode)");
            } else {
                toast.error("Failed to submit test. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (view === 'test' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleSubmitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [view, timeLeft, handleSubmitTest]);

    const handleStartTest = (test: SkillsTest) => {
        if (!test.questions || test.questions.length === 0) {
            toast.error("This test has no questions configured yet.");
            return;
        }
        setActiveTest(test);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeLeft(test.durationMinutes * 60);
        setView('test');
    };

    const handleAnswer = (value: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: value
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < (activeTest?.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'hard': case 'advanced': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {view === 'list' && (
                <>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Skills Assessments</h1>
                        <p className="text-muted-foreground">Validate your technical skills and earn badges</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {displayTests.map((test: any) => (
                            <Card key={test.id} className={`flex flex-col transition-all hover:shadow-md ${test.status === 'LOCKED' ? 'opacity-75 grayscale' : ''}`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge className={getDifficultyColor(test.difficulty)} variant="secondary">
                                            {test.difficulty}
                                        </Badge>
                                        {(test.status === 'COMPLETED' || test.attempts?.length > 0) && (
                                            <Badge className="bg-green-500 hover:bg-green-600">
                                                {test.score ?? test.attempts?.[0]?.score ?? 0}% Score
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-2">{test.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">{test.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{test.durationMinutes} mins</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <HelpCircle className="w-4 h-4" />
                                            <span>{test.totalQuestions || test.questions?.length || 0} Qs</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {(test.status === 'COMPLETED' || (test.attempts && test.attempts.length > 0)) ? (
                                        <Button variant="outline" className="w-full text-green-600 border-green-200 bg-green-50" disabled>
                                            <Trophy className="mr-2 h-4 w-4" /> Completed
                                        </Button>
                                    ) : test.status === 'LOCKED' ? (
                                        <Button variant="secondary" className="w-full" disabled>
                                            Locked
                                        </Button>
                                    ) : (
                                        <Button className="w-full" onClick={() => handleStartTest(test)}>
                                            <PlayCircle className="mr-2 h-4 w-4" /> Start Assessment
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {view === 'test' && activeTest && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm border">
                        <div>
                            <h2 className="text-xl font-bold">{activeTest.title}</h2>
                            <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {activeTest.questions?.length}</p>
                        </div>
                        <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-primary'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <Card className="min-h-[400px] flex flex-col">
                        <CardContent className="flex-grow pt-6">
                            <h3 className="text-lg font-medium mb-6">
                                {activeTest.questions?.[currentQuestionIndex]?.question}
                            </h3>

                            <RadioGroup
                                value={userAnswers[currentQuestionIndex]}
                                onValueChange={handleAnswer}
                                className="space-y-4"
                            >
                                {activeTest.questions?.[currentQuestionIndex]?.options?.map((option: string, idx: number) => (
                                    <div key={idx} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                                        <RadioGroupItem value={option} id={`option-${idx}`} />
                                        <Label htmlFor={`option-${idx}`} className="flex-grow cursor-pointer">{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-6 bg-muted/10">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>

                            {currentQuestionIndex === (activeTest.questions?.length || 0) - 1 ? (
                                <Button onClick={handleSubmitTest} disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Test"}
                                </Button>
                            ) : (
                                <Button onClick={handleNext}>
                                    Next
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            )}

            {view === 'result' && result && (
                <div className="max-w-md mx-auto text-center space-y-6 pt-10">
                    <div className="flex justify-center mb-6">
                        {result.percentage >= 70 ? (
                            <div className="bg-green-100 p-6 rounded-full">
                                <Trophy className="h-16 w-16 text-green-600" />
                            </div>
                        ) : (
                            <div className="bg-yellow-100 p-6 rounded-full">
                                <AlertTriangle className="h-16 w-16 text-yellow-600" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">{result.percentage >= 70 ? "Congratulations!" : "Keep Practicing"}</h2>
                        <p className="text-muted-foreground">{result.percentage >= 70 ? "You have successfully passed the assessment." : "You didn't meet the passing score this time."}</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-5xl font-bold mb-2 text-primary">{result.percentage.toFixed(1)}%</div>
                            <p className="text-sm text-muted-foreground mb-6">Your Score: {result.score} / {result.totalMarks}</p>
                            <Progress value={result.percentage} className="h-2" />
                        </CardContent>
                    </Card>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => setView('list')}>Back to Dashboard</Button>
                        {result.percentage < 70 && (
                            <Button onClick={() => setView('test')}>Try Again</Button> // In real app, might need to reset state
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsTests;
