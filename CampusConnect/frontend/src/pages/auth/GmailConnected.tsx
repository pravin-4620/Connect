import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const GmailConnected = () => {
    const navigate = useNavigate();

    useEffect(() => {
        toast.success('Gmail connected successfully!');
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-700">Connected!</CardTitle>
                    <CardDescription>
                        Your Gmail account has been successfully linked to CampusConnect.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        We will now sync your placement-related emails automatically.
                    </p>
                    <Button onClick={() => navigate('/student/profile')} className="w-full">
                        Return to Profile
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default GmailConnected;
