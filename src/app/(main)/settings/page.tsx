// src/app/(main)/settings/page.tsx
// Placeholder for Settings Page
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
         <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Card className="w-full max-w-2xl mx-auto">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5"/> Account Settings</CardTitle>
                    <CardDescription>Update application preferences and manage your account.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">Settings options will be added here.</p>
                    {/* Examples:
                        - Change Password
                        - Manage Email Notifications
                        - Export Data
                        - Delete Account (Danger Zone)
                    */}
                 </CardContent>
            </Card>
        </section>
    );
}