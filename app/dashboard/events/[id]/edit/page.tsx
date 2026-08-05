"use client";

import { useParams } from "next/navigation";

import EventEditor from "@/components/create-event/EventEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/hooks/useEvents";
import { eventToFormValues } from "@/lib/event-form";

export default function EditEventPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { data: event, isLoading } = useEvent(eventId);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-14 w-72" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="border-rule border border-dashed py-24 text-center">
                <p className="font-display text-2xl">Event not found</p>
                <p className="text-ink-muted mt-2 text-sm">
                    It may have been deleted.
                </p>
            </div>
        );
    }

    return (
        <EventEditor
            mode="edit"
            eventId={eventId}
            defaultValues={eventToFormValues(event)}
        />
    );
}
