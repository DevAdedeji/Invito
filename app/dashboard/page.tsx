"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import EventCard from "@/components/dashboard/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { isPast } from "@/lib/events";

type Scope = "upcoming" | "past" | "drafts";

export default function DashboardPage() {
    const { data: events, isLoading } = useEvents();
    const [scope, setScope] = useState<Scope>("upcoming");
    const [search, setSearch] = useState("");

    const all = useMemo(() => events ?? [], [events]);

    const buckets = useMemo(() => {
        const drafts = all.filter((e) => e.status === "draft");
        const live = all.filter((e) => e.status !== "draft");
        return {
            upcoming: live
                .filter((e) => !isPast(e))
                .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)),
            past: live.filter(isPast),
            drafts,
        };
    }, [all]);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return buckets[scope];
        return buckets[scope].filter(
            (e) =>
                e.title.toLowerCase().includes(term) ||
                e.location.toLowerCase().includes(term) ||
                e.hostName.toLowerCase().includes(term)
        );
    }, [buckets, scope, search]);

    const totalGuests = buckets.upcoming.reduce((sum, e) => sum + e.attendees, 0);

    return (
        <div>
            <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                    <p className="eyebrow eyebrow-left">Your events</p>
                    <h1 className="font-display mt-6 text-4xl sm:text-5xl">
                        {buckets.upcoming.length > 0
                            ? `${buckets.upcoming.length} coming up`
                            : "Nothing on the calendar"}
                    </h1>
                    {buckets.upcoming.length > 0 && (
                        <p className="text-ink-muted mt-3 text-sm">
                            {totalGuests} guest{totalGuests === 1 ? "" : "s"} confirmed
                            across your upcoming events.
                        </p>
                    )}
                </div>

                <Button asChild>
                    <Link href="/dashboard/create-event">
                        <Plus />
                        New invitation
                    </Link>
                </Button>
            </header>

            <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <Tabs
                    value={scope}
                    onValueChange={(value) => setScope(value as Scope)}
                    className="w-full sm:w-auto"
                >
                    <TabsList className="sm:w-auto">
                        <TabsTrigger value="upcoming">
                            Upcoming ({buckets.upcoming.length})
                        </TabsTrigger>
                        <TabsTrigger value="past">Past ({buckets.past.length})</TabsTrigger>
                        <TabsTrigger value="drafts">
                            Drafts ({buckets.drafts.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                    <Search className="text-ink-faint absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search events"
                        className="pl-9"
                        aria-label="Search events"
                    />
                </div>
            </div>

            <div className="mt-8">
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-72 w-full" />
                        ))}
                    </div>
                ) : visible.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <EmptyState scope={scope} searching={search.trim().length > 0} />
                )}
            </div>
        </div>
    );
}

function EmptyState({ scope, searching }: { scope: Scope; searching: boolean }) {
    if (searching) {
        return (
            <div className="border-rule border border-dashed py-24 text-center">
                <p className="font-display text-2xl">No matches</p>
                <p className="text-ink-muted mt-2 text-sm">
                    Try a different name, host or place.
                </p>
            </div>
        );
    }

    const copy: Record<Scope, { title: string; body: string }> = {
        upcoming: {
            title: "No upcoming events",
            body: "Create an invitation and share the link — replies land right here.",
        },
        past: {
            title: "Nothing in the archive yet",
            body: "Once an event has happened it moves here with its guest list intact.",
        },
        drafts: {
            title: "No drafts",
            body: "Duplicating an event puts the copy here so you can edit before sharing.",
        },
    };

    const { title, body } = copy[scope];

    return (
        <div className="border-rule border border-dashed px-6 py-24 text-center">
            <p className="font-display text-2xl">{title}</p>
            <p className="text-ink-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
                {body}
            </p>
            {scope === "upcoming" && (
                <Button asChild className="mt-8">
                    <Link href="/dashboard/create-event">
                        <Plus />
                        New invitation
                    </Link>
                </Button>
            )}
        </div>
    );
}
