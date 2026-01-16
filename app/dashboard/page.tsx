
"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EventCard from "@/components/dashboard/EventCard";
import AddEventCard from "@/components/dashboard/AddEventCard";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const { data: events, isLoading } = useEvents();

    const displayEvents = events || [];

    return (
        <div className="pb-10">
            <DashboardHeader />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    // Loading Skeletons
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-[350px] w-full bg-muted/20 rounded-xl animate-pulse" />
                    ))
                ) : (
                    <>
                        {displayEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                        <AddEventCard />
                    </>
                )}
            </div>
        </div>
    );
}
