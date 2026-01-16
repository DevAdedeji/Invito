
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardHeader() {
    const [user] = useAuthState(auth);
    const userName = user?.displayName?.split(' ')[0] || "there";

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    Welcome back, {userName}
                </h1>
                <p className="text-muted-foreground">
                    You have events scheduled for this month. Here&apos;s a look at your current gallery.
                </p>
            </div>

            <Tabs defaultValue="active" className="w-full md:w-auto">
                <TabsList className="bg-white/50 dark:bg-muted/20 border border-muted/50 p-1 rounded-full">
                    <TabsTrigger value="active" className="rounded-full px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">Active</TabsTrigger>
                    <TabsTrigger value="drafts" className="rounded-full px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">Drafts</TabsTrigger>
                    <TabsTrigger value="past" className="rounded-full px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium">Past</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
