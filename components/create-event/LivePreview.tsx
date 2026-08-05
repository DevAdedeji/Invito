"use client";

import Image from "next/image";

import { formatTimeRange } from "@/lib/datetime";
import { eventTypeLabel } from "@/lib/events";
import { toInstant, type EventFormValues } from "@/lib/event-form";

export function LivePreview({ values }: { values: EventFormValues }) {
    const {
        title,
        hostName,
        eventType,
        description,
        imageUrl,
        location,
        locationType,
        timezone,
        capacity,
    } = values;

    let when = "Date and time";
    try {
        const start = toInstant(values.startDate, values.startTime, timezone);
        const end = toInstant(values.endDate, values.endTime, timezone);
        when = `${new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            weekday: "long",
            month: "long",
            day: "numeric",
        }).format(start)} · ${formatTimeRange(
            start.toISOString(),
            end.toISOString(),
            timezone
        )}`;
    } catch {
        // Dates are mid-edit; keep the placeholder.
    }

    return (
        <div className="border-rule bg-paper-raised border">
            {imageUrl ? (
                <div className="relative aspect-16/10 w-full">
                    <Image src={imageUrl} alt="" fill className="object-cover" />
                </div>
            ) : (
                <div className="bg-paper-sunken text-ink-faint meta flex aspect-16/10 w-full items-center justify-center">
                    Cover
                </div>
            )}

            <div className="px-8 py-10 text-center">
                <p className="eyebrow justify-center">You&rsquo;re invited</p>

                <h2 className="font-display mt-7 text-3xl leading-[1.06] text-balance">
                    {title || "Your event name"}
                </h2>

                <p className="text-ink-muted mt-4 text-sm">
                    Hosted by{" "}
                    <span className="text-ink decoration-seal/50 underline decoration-1 underline-offset-4">
                        {hostName || "you"}
                    </span>
                </p>

                <p className="meta text-ink-faint mt-3">{eventTypeLabel(eventType)}</p>

                <div className="border-rule mt-8 space-y-5 border-t pt-7 text-left">
                    <div>
                        <p className="meta text-ink-faint">When</p>
                        <p className="mt-1.5 text-sm">{when}</p>
                    </div>
                    <div>
                        <p className="meta text-ink-faint">Where</p>
                        <p className="mt-1.5 text-sm wrap-break-word">
                            {locationType === "online"
                                ? location || "Online"
                                : location || "To be announced"}
                        </p>
                    </div>
                    {capacity > 0 && (
                        <div>
                            <p className="meta text-ink-faint">Capacity</p>
                            <p className="mt-1.5 text-sm">{capacity} guests</p>
                        </div>
                    )}
                </div>

                {description && (
                    <p className="border-rule text-ink-muted mt-7 border-t pt-7 text-left text-sm leading-[1.75] whitespace-pre-line">
                        {description.slice(0, 220)}
                        {description.length > 220 && "…"}
                    </p>
                )}
            </div>
        </div>
    );
}
