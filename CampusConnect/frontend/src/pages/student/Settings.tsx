import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Bell, Lock, Moon, Sun, Monitor, HelpCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import { useQuery } from '../../hooks/useQuery';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import { useTheme } from '../../context/ThemeContext';

const StudentSettings = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useAuth();
    const { theme, setTheme } = useTheme();
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);

    // Fetch Settings
    useQuery<any>(() => studentAPI.getSettings(), {
        onSuccess: (data) => {
            // Check if data itself has preferences or is wrapped
            const prefs = data?.preferences || data?.data?.preferences || {};
            if (prefs) {
                setEmailNotifs(prefs.emailNotifs ?? true);
                setPushNotifs(prefs.pushNotifs ?? true);
                // Don't overwrite theme from DB here to avoid conflict with localStorage which is source of truth for UI
            }
        },
        onError: () => {
            // Silent fail
        }
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await studentAPI.updateSettings({
                emailNotifs,
                pushNotifs,
                theme // Current theme from context
            });
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Notifications */}
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
                                <span className="font-normal text-xs text-muted-foreground">Receive updates about assignments and events</span>
                            </Label>
                            <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="push-notifs" className="flex flex-col space-y-1">
                                <span>Push Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive in-app alerts and browser notifications</span>
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

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the interface look</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-2">
                        <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            className="flex flex-col items-center justify-center h-20 gap-2"
                            onClick={() => setTheme('light')}
                        >
                            <Sun className="h-6 w-6" />
                            Light
                        </Button>
                        <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            className="flex flex-col items-center justify-center h-20 gap-2"
                            onClick={() => setTheme('dark')}
                        >
                            <Moon className="h-6 w-6" />
                            Dark
                        </Button>
                        <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            className="flex flex-col items-center justify-center h-20 gap-2"
                            onClick={() => setTheme('system')}
                        >
                            <Monitor className="h-6 w-6" />
                            System
                        </Button>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your password and authentication</CardDescription>
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

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Two-Factor Authentication</h4>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                            </div>
                            <Button variant="outline" disabled>Enable 2FA (Coming Soon)</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Support */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Support & Legal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Button variant="ghost" className="justify-start h-auto py-4 px-4 border">
                            <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                                <div className="font-medium">Terms of Service</div>
                                <div className="text-xs text-muted-foreground">Read our terms and conditions</div>
                            </div>
                        </Button>
                        <Button variant="ghost" className="justify-start h-auto py-4 px-4 border">
                            <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                                <div className="font-medium">Privacy Policy</div>
                                <div className="text-xs text-muted-foreground">Read how we handle your data</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentSettings;
