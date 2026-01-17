import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertCircle } from 'lucide-react';

const GmailError = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center border-red-200">
                <CardHeader>
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-700">Connection Failed</CardTitle>
                    <CardDescription>
                        We encountered an issue linking your Gmail account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Please try again later or contact support if the issue persists.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/student/profile')} className="w-full">
                        Return to Profile
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default GmailError;
