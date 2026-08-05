"use client";

import { useMemo } from "react";

import EventEditor from "@/components/create-event/EventEditor";
import { browserTimeZone } from "@/lib/datetime";
import { emptyEventValues } from "@/lib/event-form";

export default function CreateEventPage() {
    const defaultValues = useMemo(
        () => emptyEventValues(browserTimeZone()),
        []
    );

    return <EventEditor mode="create" defaultValues={defaultValues} />;
}
