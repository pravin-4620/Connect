/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { studentAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useQuery } from '../../hooks/useQuery';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Plus, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { GatePass } from '../../types';

interface GatePassForm {
    reason: string;
    fromDate: string;
    toDate: string;
}

const StudentGatePass = () => {
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<GatePassForm>();

    const { data: rawPasses, loading, refetch } = useQuery<GatePass[]>(() => studentAPI.getGatePasses(), {
        onError: () => {
            console.error("Failed to fetch gate passes");
            toast.error("Failed to load gate pass history");
        }
    });

    // Process data
    const passes = Array.isArray(rawPasses) ? rawPasses : (rawPasses && (rawPasses as any).gatePasses) ? (rawPasses as any).gatePasses : [];
    // Sort descending
    passes.sort((a: GatePass, b: GatePass) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const onSubmit = async (data: GatePassForm) => {
        setIsSubmitting(true);
        try {
            // Validation: toDate > fromDate
            if (new Date(data.toDate) <= new Date(data.fromDate)) {
                toast.error("Return time must be after departure time");
                setIsSubmitting(false);
                return;
            }

            await studentAPI.applyForGatePass(data);
            toast.success("Gate pass requested successfully");

            // Refresh list
            refetch();

            setIsApplyOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to request gate pass");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Pending</Badge>;
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gate Pass</h1>
                    <p className="text-muted-foreground">Request permission to leave campus</p>
                </div>
                <Button onClick={() => setIsApplyOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {passes.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No gate pass requests found.</p>
                    </div>
                ) : passes.map((pass: GatePass) => (
                    <Card key={pass.id} className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${pass.status === 'APPROVED' ? 'bg-green-500' :
                            pass.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-medium">
                                    {pass.reason}
                                </CardTitle>
                                {getStatusBadge(pass.status)}
                            </div>
                            <CardDescription className="text-xs">
                                Requested on {format(new Date(pass.createdAt), 'MMM d, yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3 pt-2">
                            <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase">Out</p>
                                    <p className="font-semibold">{format(new Date(pass.fromDate), 'MMM d, h:mm a')}</p>
                                </div>
                                <div className="h-px w-8 bg-muted-foreground/30" />
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase">In</p>
                                    <p className="font-semibold">{format(new Date(pass.toDate), 'MMM d, h:mm a')}</p>
                                </div>
                            </div>
                            {pass.approvalNote && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 italic">
                                    Note: {pass.approvalNote}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogContent className="sm:max-w-[425px] z-[100]">
                    <DialogHeader>
                        <DialogTitle>Request Gate Pass</DialogTitle>
                        <DialogDescription>
                            Please provide valid reason and timing.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Input
                                id="reason"
                                placeholder="E.g. Medical Emergency, Family Visit"
                                {...register('reason', { required: 'Reason is required' })}
                            />
                            {errors.reason && <span className="text-xs text-destructive">{errors.reason.message}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fromDate">Departure Time</Label>
                                <Input
                                    id="fromDate"
                                    type="datetime-local"
                                    {...register('fromDate', { required: 'Required' })}
                                />
                                {errors.fromDate && <span className="text-xs text-destructive">{errors.fromDate.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="toDate">Return Time</Label>
                                <Input
                                    id="toDate"
                                    type="datetime-local"
                                    {...register('toDate', { required: 'Required' })}
                                />
                                {errors.toDate && <span className="text-xs text-destructive">{errors.toDate.message}</span>}
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentGatePass;
