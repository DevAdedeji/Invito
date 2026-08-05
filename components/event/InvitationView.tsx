import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, ExternalLink, MapPin, Video } from "lucide-react";

import RsvpCard from "@/components/event/RsvpCard";
import Discussion from "@/components/event/Discussion";
import Gallery from "@/components/event/Gallery";
import { Button } from "@/components/ui/button";
import {
    formatLongDate,
    formatShortDate,
    formatTimeRange,
    googleCalendarUrl,
} from "@/lib/datetime";
import { eventTypeLabel, isPast } from "@/lib/events";
import type { DiscussionMessage, InvitoEvent, PublicAttendee } from "@/lib/types";

interface InvitationViewProps {
    event: InvitoEvent;
    attendees: PublicAttendee[];
    /** Renders the sample invitation: nothing is written and nothing persists. */
    demo?: boolean;
    demoMessages?: DiscussionMessage[];
}

export default function InvitationView({
    event,
    attendees,
    demo = false,
    demoMessages,
}: InvitationViewProps) {
    const past = isPast(event);
    const mapUrl =
        event.locationType === "online"
            ? event.location
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                event.location
            )}`;

    return (
        <main className="bg-paper min-h-screen">
            {event.imageUrl && (
                <div className="relative h-[38vh] min-h-64 w-full sm:h-[46vh]">
                    <Image
                        src={event.imageUrl}
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className="from-paper absolute inset-x-0 bottom-0 h-40 bg-linear-to-t to-transparent" />
                </div>
            )}

            <article
                className={`mx-auto w-full max-w-2xl px-6 pb-24 ${event.imageUrl ? "pt-14" : "pt-20"
                    }`}
            >
                <header className="text-center">
                    <p className="eyebrow justify-center">
                        {past ? "This gathering has passed" : "You're invited"}
                    </p>

                    <h1 className="font-display mt-8 text-[2.75rem] leading-[1.05] text-balance sm:text-6xl">
                        {event.title}
                    </h1>

                    {event.hostName && (
                        <p className="text-ink-muted mt-6 text-base">
                            Hosted by{" "}
                            <span className="text-ink decoration-seal/50 underline decoration-1 underline-offset-4">
                                {event.hostName}
                            </span>
                        </p>
                    )}

                    <p className="meta text-ink-faint mt-4">
                        {eventTypeLabel(event.eventType)}
                    </p>
                </header>

                <section className="border-rule divide-rule mt-14 divide-y border-t">
                    <div className="flex flex-col gap-1 py-7 sm:flex-row sm:items-baseline sm:gap-8">
                        <p className="meta text-ink-faint sm:w-24 sm:shrink-0">When</p>
                        <div>
                            <p className="font-display text-2xl">
                                {formatLongDate(event.date, event.timezone)}
                            </p>
                            <p className="text-ink-muted mt-1.5 text-sm">
                                {formatTimeRange(event.date, event.endDate, event.timezone)}
                            </p>
                            {!past && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button asChild variant="subtle" size="sm">
                                        <a href={`/events/${event.id}/calendar`}>
                                            <CalendarPlus />
                                            Add to calendar
                                        </a>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <a
                                            href={googleCalendarUrl({
                                                title: event.title,
                                                description:
                                                    event.description ??
                                                    `You're invited to ${event.title}.`,
                                                location: event.location,
                                                startIso: event.date,
                                                endIso: event.endDate,
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Google Calendar
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 py-7 sm:flex-row sm:items-baseline sm:gap-8">
                        <p className="meta text-ink-faint sm:w-24 sm:shrink-0">Where</p>
                        <div className="min-w-0">
                            <p className="font-display text-2xl wrap-break-word">
                                {event.locationType === "online"
                                    ? "Online"
                                    : event.location || "To be announced"}
                            </p>
                            {event.location && (
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-seal decoration-seal/40 hover:decoration-seal mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4"
                                >
                                    {event.locationType === "online" ? (
                                        <>
                                            <Video className="size-3.5" />
                                            Join link
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="size-3.5" />
                                            View on map
                                        </>
                                    )}
                                    <ExternalLink className="size-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {event.description && (
                    <section className="mt-12">
                        <p className="dropcap text-ink-muted text-[15px] leading-[1.8] whitespace-pre-line">
                            {event.description}
                        </p>
                    </section>
                )}

                {event.guestListPublic && attendees.length > 0 && (
                    <section className="border-rule mt-14 border-t pt-12">
                        <p className="eyebrow eyebrow-left">
                            Who&rsquo;s coming ·{" "}
                            {attendees.reduce((sum, a) => sum + 1 + a.plusOnes, 0)}
                        </p>
                        <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
                            {attendees.map((attendee) => (
                                <li
                                    key={attendee.id}
                                    className="border-rule text-ink-muted rounded-xs border px-3 py-1.5 text-sm"
                                >
                                    {attendee.firstName}
                                    {attendee.plusOnes > 0 && (
                                        <span className="text-ink-faint">
                                            {" "}
                                            +{attendee.plusOnes}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="mt-14">
                    <RsvpCard event={event} demo={demo} />
                </div>

                {event.discussionEnabled && (
                    <div className="mt-14">
                        <Discussion eventId={event.id} demoMessages={demoMessages} />
                    </div>
                )}

                {event.galleryEnabled && !demo && (
                    <div className="mt-14">
                        <Gallery eventId={event.id} />
                    </div>
                )}

                <footer className="border-rule mt-20 border-t pt-8 text-center">
                    <p className="meta text-ink-faint">
                        {formatShortDate(event.date, event.timezone)}
                    </p>
                    <Link
                        href="/"
                        className="meta text-ink-faint hover:text-ink mt-4 inline-block transition-colors"
                    >
                        Made with Invito
                    </Link>
                </footer>
            </article>
        </main>
    );
}
