// src/app/(main)/dashboard/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import Link from "next/link";
import { Users, PlusCircle, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components (optional for activity)

// --- Placeholder Data Types ---
interface Activity {
    id: string;
    user: string;
    action: string;
    timestamp: Date;
    image: string | null | undefined;
}
interface Birthday {
    id: string;
    name: string;
    date: Date;
    daysUntil?: number; // Optional
}
interface Stats {
    totalMembers: number;
    registeredUsers: number;
    generations: number;
}
// --- End Placeholder Data Types ---

// Server component for the dashboard
export default async function DashboardPage() {
    const session = await getAuthSession();

    if (!session?.user) {
        redirect('/login');
    }

    // --- Placeholder Data Fetching ---
    // Replace these with actual async functions calling your backend/API
    const getRecentActivity = async (userId: string): Promise<Activity[]> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        // Example data:
        // return [
        //     { id: 'act1', user: 'Jane Doe', action: 'added John Smith as spouse.', timestamp: new Date(Date.now() - 3600000), image: null },
        //     { id: 'act2', user: 'You', action: 'added a new memory.', timestamp: new Date(Date.now() - 86400000), image: session.user.image },
        // ];
        return []; // Start with empty
    };

    const getUpcomingBirthdays = async (userId: string): Promise<Birthday[]> => {
        await new Promise(resolve => setTimeout(resolve, 60));
        // Example data:
        // return [
        //     { id: 'bday1', name: 'Mom', date: new Date(2024, 11, 25) },
        //     { id: 'bday2', name: 'Grandpa Joe', date: new Date(2025, 0, 10) },
        // ];
         return []; // Start with empty
    };

    const getTreeStats = async (userId: string): Promise<Stats> => {
         await new Promise(resolve => setTimeout(resolve, 40));
         return {
             totalMembers: 1,
             registeredUsers: 1,
             generations: 1,
         };
    };

    // Fetch data
    const recentActivity = await getRecentActivity(session.user.id);
    const upcomingBirthdays = await getUpcomingBirthdays(session.user.id);
    const treeStats = await getTreeStats(session.user.id);
    // --- End Placeholder Data Fetching ---

    // Helper function for initials
    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    return (
        <section className="grid items-start gap-6 pb-8 pt-6 md:py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                        Welcome, {session.user.name || 'User'}!
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                        Here's a quick overview of your family space.
                    </p>
                </div>
                {/* Modified Invite Button: Style Link directly */}
                <Link href="/invite" className={cn(buttonVariants({ variant: "default" }))}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Invite Family
                </Link>
            </div>

            {/* Dashboard Widgets/Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Quick Actions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {/* Modified Quick Action Buttons: Style Links directly */}
                        <Link href="/tree" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
                            <Users className="mr-2 h-4 w-4 text-primary"/> View Family Tree
                        </Link>
                         <Link href="/add-member" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
                            <PlusCircle className="mr-2 h-4 w-4 text-primary"/> Add New Member
                        </Link>
                         <Link href="/search" className={cn(buttonVariants({ variant: "outline" }), "justify-start")}>
                            <Search className="mr-2 h-4 w-4 text-primary"/> Search Relatives
                        </Link>
                    </CardContent>
                </Card>

                 {/* Notifications/Activity Card */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><Bell className="h-5 w-5"/> Recent Activity</CardTitle>
                        <CardDescription>Updates from your family.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {recentActivity.length === 0 ? (
                           <p className="text-sm text-muted-foreground">No new activity yet.</p>
                       ) : (
                           <ul className="space-y-2 max-h-40 overflow-y-auto"> {/* Added max-height and scroll */}
                               {recentActivity.slice(0, 5).map((activity) => ( // Show max 5 items
                                   <li key={activity.id} className="flex items-center gap-2 text-sm border-b pb-1 last:border-b-0 pr-1">
                                       <Avatar className="h-6 w-6 flex-shrink-0">
                                            <AvatarImage src={activity.image ?? undefined} alt={activity.user} />
                                            <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                                       </Avatar>
                                       <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis"> {/* Prevent long text wrapping */}
                                            <strong>{activity.user === session.user.name ? 'You' : activity.user}:</strong> {activity.action}
                                       </span>
                                       {/* Add relative time later using date-fns/formatDistanceToNow */}
                                       <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                                           {activity.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                       </span>
                                   </li>
                               ))}
                           </ul>
                       )}
                    </CardContent>
                </Card>

                 {/* Upcoming Birthdays Card */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Upcoming Birthdays</CardTitle>
                        <CardDescription>Don't miss a celebration!</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {upcomingBirthdays.length === 0 ? (
                           <p className="text-sm text-muted-foreground">No upcoming birthdays found.</p>
                       ) : (
                           <ul className="space-y-1">
                               {upcomingBirthdays.slice(0, 4).map((bday) => ( // Show max 4
                                   <li key={bday.id} className="flex justify-between text-sm">
                                       <span>{bday.name}</span>
                                       <span className="text-muted-foreground">{bday.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                   </li>
                               ))}
                           </ul>
                       )}
                    </CardContent>
                </Card>

                 {/* Tree Statistics Card */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Tree Overview</CardTitle>
                         <CardDescription>A snapshot of your family.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Members:</span>
                           <span className="font-medium">{treeStats?.totalMembers ?? 0}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Registered Users:</span>
                           <span className="font-medium">{treeStats?.registeredUsers ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Generations Found:</span>
                           <span className="font-medium">{treeStats?.generations ?? 0}</span>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </section>
    );
}