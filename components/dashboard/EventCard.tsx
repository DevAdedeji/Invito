import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatShortDate, formatTime } from "@/lib/datetime";
import { isFull, isPast } from "@/lib/events";
import type { InvitoEvent } from "@/lib/types";

export default function EventCard({ event }: { event: InvitoEvent }) {
    const past = isPast(event);
    const full = isFull(event);

    return (
        <Link
            href={`/dashboard/events/${event.id}`}
            className="group border-rule hover:border-ink flex flex-col border transition-colors"
        >
            <div className="bg-paper-sunken relative aspect-16/10 w-full overflow-hidden">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="text-ink-faint flex h-full items-center justify-center">
                        <ImageOff className="size-5" />
                    </div>
                )}

                <div className="absolute top-3 left-3 flex gap-1.5">
                    {event.status === "draft" && <Badge variant="secondary">Draft</Badge>}
                    {past ? (
                        <Badge variant="declined">Past</Badge>
                    ) : full ? (
                        <Badge variant="seal">Full</Badge>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="meta text-ink-faint">
                    {formatShortDate(event.date, event.timezone)} ·{" "}
                    {formatTime(event.date, event.timezone)}
                </p>

                <h3 className="font-display group-hover:text-seal mt-2.5 line-clamp-2 text-xl transition-colors">
                    {event.title}
                </h3>

                <div className="border-rule mt-auto flex items-end justify-between border-t pt-4">
                    <div>
                        <p className="meta text-ink-faint">Attending</p>
                        <p className="font-display mt-1 text-2xl tabular-nums">
                            {event.attendees}
                            {event.capacity > 0 && (
                                <span className="text-ink-faint text-base">
                                    {" "}
                                    / {event.capacity}
                                </span>
                            )}
                        </p>
                    </div>
                    <ArrowUpRight className="text-ink-faint group-hover:text-ink size-4 transition-colors" />
                </div>
            </div>
        </Link>
    );
}
