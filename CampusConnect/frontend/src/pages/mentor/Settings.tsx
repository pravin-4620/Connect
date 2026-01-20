import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Lock, HelpCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { mentorAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';

const MentorSettings = () => {
    useAuth();
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await mentorAPI.getSettings();
                if (data.success && data.data.settings) {
                    const s = data.data.settings;
                    setEmailNotifs(s.emailNotifications);
                    setPushNotifs(s.pushNotifications);

                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await mentorAPI.updateSettings({
                settings: {
                    emailNotifications: emailNotifs,
                    pushNotifications: pushNotifs
                }
            });
            toast.success("Settings saved successfully");


        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage how you receive alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                                <span>Email Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive updates about student requests</span>
                            </Label>
                            <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="push-notifs" className="flex flex-col space-y-1">
                                <span>Push Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive in-app alerts</span>
                            </Label>
                            <Switch id="push-notifs" checked={pushNotifs} onCheckedChange={setPushNotifs} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave} variant="outline" size="sm" disabled={saving}>
                            {saving ? "Saving..." : "Save Preferences"}
                        </Button>
                    </CardFooter>
                </Card>



                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Password</h4>
                                <p className="text-sm text-muted-foreground">Secure your account</p>
                            </div>
                            <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>Change Password</Button>
                        </div>
                        <ChangePasswordModal
                            isOpen={changePasswordOpen}
                            onClose={() => setChangePasswordOpen(false)}
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            About
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="ghost" className="justify-start h-auto w-full py-4 px-4 border">
                            <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                                <div className="font-medium">Platform Documentation</div>
                                <div className="text-xs text-muted-foreground">Learn how to use the mentor dashboard efficiently</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MentorSettings;
