"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    Copy,
    Download,
    ExternalLink,
    Loader2,
    MoreHorizontal,
    Pencil,
    Send,
    Share2,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import AnnounceDialog from "@/components/dashboard/AnnounceDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    useDeleteEvent,
    useDuplicateEvent,
    useEvent,
    useGuests,
    useRemoveGuest,
} from "@/hooks/useEvents";
import { downloadCsv, guestsToCsv } from "@/lib/csv";
import { formatLongDate, formatShortDate, formatTimeRange } from "@/lib/datetime";
import { isPast, rsvpStatusLabel } from "@/lib/events";
import type { Guest, RsvpStatus } from "@/lib/types";

const STATUS_VARIANT: Record<
    RsvpStatus,
    "attending" | "maybe" | "declined" | "seal"
> = {
    attending: "attending",
    maybe: "maybe",
    not_attending: "declined",
    waitlisted: "seal",
};

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const { data: event, isLoading: loadingEvent } = useEvent(eventId);
    const { data: guests, isLoading: loadingGuests } = useGuests(eventId);

    const deleteEvent = useDeleteEvent();
    const duplicateEvent = useDuplicateEvent();
    const removeGuest = useRemoveGuest(eventId);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | RsvpStatus>("all");
    const [announceOpen, setAnnounceOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const guestList = useMemo(() => guests ?? [], [guests]);

    const stats = useMemo(() => {
        const attending = guestList.filter((g) => g.status === "attending");
        return {
            replies: guestList.length,
            attending: attending.length,
            heads: attending.reduce((sum, g) => sum + 1 + g.plusOnes, 0),
            plusOnes: attending.reduce((sum, g) => sum + g.plusOnes, 0),
            maybe: guestList.filter((g) => g.status === "maybe").length,
            declined: guestList.filter((g) => g.status === "not_attending").length,
            waitlisted: guestList.filter((g) => g.status === "waitlisted").length,
        };
    }, [guestList]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return guestList.filter((guest) => {
            const matchesTerm =
                !term ||
                guest.name.toLowerCase().includes(term) ||
                guest.email.toLowerCase().includes(term);
            const matchesStatus =
                statusFilter === "all" || guest.status === statusFilter;
            return matchesTerm && matchesStatus;
        });
    }, [guestList, search, statusFilter]);

    if (loadingEvent) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-16 w-96" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="border-rule border border-dashed py-24 text-center">
                <p className="font-display text-2xl">Event not found</p>
                <Button asChild variant="ghost" className="mt-6">
                    <Link href="/dashboard">Back to events</Link>
                </Button>
            </div>
        );
    }

    const shareUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/events/${event.id}`
            : `/events/${event.id}`;

    async function handleShare() {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Invitation link copied.");
        } catch {
            toast.error("Couldn't copy — select the link manually.");
        }
    }

    function handleExport() {
        if (!event) return;
        if (guestList.length === 0) {
            toast.error("No replies to export yet.");
            return;
        }

        const slug =
            event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
            "guests";

        downloadCsv(
            `${slug}-guests.csv`,
            guestsToCsv(guestList, event.customQuestions, event.timezone)
        );
        toast.success(`Exported ${guestList.length} replies.`);
    }

    async function handleDuplicate() {
        if (!event) return;
        try {
            const newId = await duplicateEvent.mutateAsync(event);
            toast.success("Copy created as a draft.");
            router.push(`/dashboard/events/${newId}/edit`);
        } catch {
            toast.error("Couldn't duplicate that event.");
        }
    }

    async function handleDelete() {
        try {
            await deleteEvent.mutateAsync(eventId);
            toast.success("Event deleted.");
            router.push("/dashboard");
        } catch {
            toast.error("Couldn't delete that event.");
        }
    }

    async function handleRemoveGuest(guest: Guest) {
        try {
            await removeGuest.mutateAsync(guest);
            toast.success(`Removed ${guest.name}.`);
        } catch {
            toast.error("Couldn't remove that guest.");
        }
    }

    return (
        <div>
            <nav className="meta text-ink-faint flex items-center gap-2">
                <Link href="/dashboard" className="hover:text-ink transition-colors">
                    Events
                </Link>
                <span aria-hidden>/</span>
                <span className="text-ink-muted truncate">{event.title}</span>
            </nav>

            <header className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        {event.status === "draft" && (
                            <Badge variant="secondary">Draft</Badge>
                        )}
                        {isPast(event) && <Badge variant="declined">Past</Badge>}
                    </div>

                    <h1 className="font-display mt-4 text-4xl text-balance sm:text-5xl">
                        {event.title}
                    </h1>

                    <div className="text-ink-muted mt-5 space-y-1.5 text-sm">
                        <p>{formatLongDate(event.date, event.timezone)}</p>
                        <p>{formatTimeRange(event.date, event.endDate, event.timezone)}</p>
                        <p className="wrap-break-word">
                            {event.locationType === "online" ? "Online" : event.location}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="subtle" size="sm" onClick={handleShare}>
                        <Share2 />
                        Copy link
                    </Button>
                    <Button asChild variant="subtle" size="sm">
                        <a href={`/events/${event.id}`} target="_blank" rel="noreferrer">
                            <ExternalLink />
                            View
                        </a>
                    </Button>
                    <Button size="sm" onClick={() => setAnnounceOpen(true)}>
                        <Send />
                        Message guests
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="subtle" size="icon-sm" aria-label="More actions">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/events/${event.id}/edit`}>
                                    <Pencil />
                                    Edit invitation
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleExport}>
                                <Download />
                                Export guest list
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleDuplicate}>
                                <Copy />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setConfirmDelete(true)}
                            >
                                <Trash2 />
                                Delete event
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <section className="border-rule divide-rule mt-12 grid grid-cols-2 divide-x border-y sm:grid-cols-4">
                <Stat
                    label="Heads coming"
                    value={stats.heads}
                    detail={
                        event.capacity > 0
                            ? `of ${event.capacity} places`
                            : `${stats.plusOnes} plus-ones`
                    }
                    emphasis
                />
                <Stat label="Maybe" value={stats.maybe} detail="undecided" />
                <Stat label="Declined" value={stats.declined} detail="can't make it" />
                <Stat
                    label={event.waitlistEnabled ? "Waitlisted" : "Total replies"}
                    value={event.waitlistEnabled ? stats.waitlisted : stats.replies}
                    detail={event.waitlistEnabled ? "in the queue" : "responses"}
                />
            </section>

            <section className="mt-14">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="eyebrow eyebrow-left">The guest list</p>

                    <div className="flex gap-3">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search guests"
                            className="w-full sm:w-56"
                            aria-label="Search guests"
                        />
                        <Select
                            value={statusFilter}
                            onValueChange={(value) =>
                                setStatusFilter(value as "all" | RsvpStatus)
                            }
                        >
                            <SelectTrigger className="w-40 shrink-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All replies</SelectItem>
                                <SelectItem value="attending">Attending</SelectItem>
                                <SelectItem value="maybe">Maybe</SelectItem>
                                <SelectItem value="not_attending">Declined</SelectItem>
                                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border-rule mt-6 border">
                    {loadingGuests ? (
                        <div className="space-y-3 p-5">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <Users className="text-ink-faint mx-auto size-6" />
                            <p className="font-display mt-5 text-xl">
                                {guestList.length === 0
                                    ? "No replies yet"
                                    : "Nothing matches that"}
                            </p>
                            <p className="text-ink-muted mx-auto mt-2 max-w-xs text-sm">
                                {guestList.length === 0
                                    ? "Share the invitation link and replies will appear here."
                                    : "Try a different name or filter."}
                            </p>
                            {guestList.length === 0 && (
                                <Button
                                    variant="subtle"
                                    size="sm"
                                    className="mt-6"
                                    onClick={handleShare}
                                >
                                    <Share2 />
                                    Copy link
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Reply</TableHead>
                                    <TableHead className="text-right">Heads</TableHead>
                                    <TableHead>Replied</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((guest) => (
                                    <TableRow key={guest.id} className="group">
                                        <TableCell>
                                            <p className="font-medium">{guest.name}</p>
                                            <p className="text-ink-faint text-xs">{guest.email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_VARIANT[guest.status]}>
                                                {rsvpStatusLabel(guest.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {guest.status === "attending" ? 1 + guest.plusOnes : "—"}
                                            {guest.plusOnes > 0 && guest.status === "attending" && (
                                                <span className="text-ink-faint text-xs">
                                                    {" "}
                                                    (+{guest.plusOnes})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-ink-muted text-sm whitespace-nowrap">
                                            {formatShortDate(guest.rsvpDate, event.timezone)}
                                        </TableCell>
                                        <TableCell className="text-ink-muted max-w-56 truncate text-sm">
                                            {guest.note ||
                                                event.customQuestions
                                                    .map((q) => guest.answers[q.id])
                                                    .filter(Boolean)
                                                    .join(" · ") ||
                                                "—"}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                                        aria-label={`Actions for ${guest.name}`}
                                                    >
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <a href={`mailto:${guest.email}`}>
                                                            <Send />
                                                            Email {guest.name.split(" ")[0]}
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onSelect={() => handleRemoveGuest(guest)}
                                                    >
                                                        <Trash2 />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {filtered.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-ink-faint text-xs">
                            Showing {filtered.length} of {guestList.length} replies
                        </p>
                        <Button variant="ghost" size="sm" onClick={handleExport}>
                            <Download />
                            Export CSV
                        </Button>
                    </div>
                )}
            </section>

            <AnnounceDialog
                open={announceOpen}
                onOpenChange={setAnnounceOpen}
                event={event}
                guests={guestList}
            />

            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this event?</DialogTitle>
                        <DialogDescription>
                            {event.title} and its {guestList.length} repl
                            {guestList.length === 1 ? "y" : "ies"} will be permanently
                            removed. The invitation link will stop working. This cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleteEvent.isPending}
                        >
                            Keep it
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteEvent.isPending}
                        >
                            {deleteEvent.isPending ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Deleting
                                </>
                            ) : (
                                <>
                                    <Trash2 />
                                    Delete permanently
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Stat({
    label,
    value,
    detail,
    emphasis,
}: {
    label: string;
    value: number;
    detail: string;
    emphasis?: boolean;
}) {
    return (
        <div className="px-5 py-7 first:pl-0 sm:px-7">
            <p className="meta text-ink-faint">{label}</p>
            <p
                className={`font-display mt-3 text-4xl tabular-nums ${emphasis ? "text-seal" : "text-ink"
                    }`}
            >
                {value}
            </p>
            <p className="text-ink-faint mt-1.5 text-xs">{detail}</p>
        </div>
    );
}
