import type {
    CustomQuestion,
    EventStatus,
    Guest,
    InvitoEvent,
    LocationType,
    PublicAttendee,
    RsvpStatus,
} from "@/lib/types";

type Raw = Record<string, unknown>;

/**
 * Firestore hands back Timestamps, Dates or ISO strings depending on how the
 * document was written. Documents created before the redesign use all three.
 */
export function toIso(value: unknown): string | null {
    if (!value) return null;
    if (typeof value === "string") {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value.toISOString();
    }
    if (typeof value === "object") {
        const candidate = value as { toDate?: () => Date; seconds?: number };
        if (typeof candidate.toDate === "function") {
            const d = candidate.toDate();
            return Number.isNaN(d.getTime()) ? null : d.toISOString();
        }
        if (typeof candidate.seconds === "number") {
            return new Date(candidate.seconds * 1000).toISOString();
        }
    }
    return null;
}

function bool(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function int(value: unknown, fallback: number): number {
    const n = typeof value === "string" ? Number(value) : value;
    return typeof n === "number" && Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function str(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

function normalizeQuestions(value: unknown): CustomQuestion[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry, i) => {
        if (typeof entry !== "object" || entry === null) return [];
        const q = entry as Raw;
        const label = str(q.label).trim();
        if (!label) return [];
        const type = q.type === "long" || q.type === "choice" ? q.type : "short";
        return [
            {
                id: str(q.id) || `q${i}`,
                label,
                type,
                required: bool(q.required, false),
                options: Array.isArray(q.options)
                    ? q.options.filter((o): o is string => typeof o === "string")
                    : [],
            },
        ];
    });
}

const DEFAULT_TZ = "UTC";

/**
 * Fills in every field added by the redesign so that events written by the old
 * version of the app keep rendering.
 */
export function normalizeEvent(id: string, raw: Raw): InvitoEvent {
    const start =
        toIso(raw.date) ?? toIso(raw.startDateTime) ?? toIso(raw.startDate);
    // Older documents stored `endDate` as a date-only Timestamp from the picker,
    // so the combined `endDateTime` is the more trustworthy source.
    const end = toIso(raw.endDateTime) ?? toIso(raw.endDate);

    const rawStatus = str(raw.status, "published");
    const status: EventStatus = rawStatus === "draft" ? "draft" : "published";

    const locationType: LocationType =
        raw.locationType === "online" ? "online" : "physical";

    const capacity = Math.max(0, int(raw.capacity, 0));

    return {
        id,
        title: str(raw.title, "Untitled event"),
        hostName: str(raw.hostName),
        eventType: str(raw.eventType, "other"),
        description: str(raw.description) || null,
        imageUrl: str(raw.imageUrl) || null,

        date: start ?? new Date(0).toISOString(),
        endDate: end,
        timezone: str(raw.timezone) || DEFAULT_TZ,

        location: str(raw.location),
        locationType,

        capacity,
        attendees: Math.max(0, int(raw.attendees, 0)),

        allowPlusOnes: bool(raw.allowPlusOnes, false),
        maxPlusOnes: Math.max(0, int(raw.maxPlusOnes, 0)),
        waitlistEnabled: bool(raw.waitlistEnabled, false),
        guestListPublic: bool(raw.guestListPublic, false),
        discussionEnabled: bool(raw.discussionEnabled, false),
        galleryEnabled: bool(raw.galleryEnabled, false),
        customQuestions: normalizeQuestions(raw.customQuestions),

        creatorId: str(raw.creatorId) || str(raw.userId),
        status,
        createdAt: toIso(raw.createdAt),
    };
}

export function normalizeGuest(id: string, raw: Raw): Guest {
    const status = raw.status;
    const rsvpStatus: RsvpStatus =
        status === "attending" ||
            status === "not_attending" ||
            status === "maybe" ||
            status === "waitlisted"
            ? status
            : "maybe";

    return {
        id,
        name: str(raw.name, "Guest"),
        email: str(raw.email),
        status: rsvpStatus,
        // Pre-redesign documents called this `guests`.
        plusOnes: Math.max(0, int(raw.plusOnes ?? raw.guests, 0)),
        note: str(raw.note),
        answers:
            typeof raw.answers === "object" && raw.answers !== null
                ? Object.fromEntries(
                    Object.entries(raw.answers as Raw).map(([k, v]) => [k, str(v)])
                )
                : {},
        rsvpDate: toIso(raw.rsvpDate) ?? new Date(0).toISOString(),
        phone: str(raw.phone),
    };
}

export function normalizePublicAttendee(id: string, raw: Raw): PublicAttendee {
    return {
        id,
        firstName: str(raw.firstName, "Guest"),
        plusOnes: Math.max(0, int(raw.plusOnes, 0)),
        rsvpDate: toIso(raw.rsvpDate) ?? new Date(0).toISOString(),
    };
}

/** Heads this guest brings, counting themselves. */
export function headcount(guest: Pick<Guest, "status" | "plusOnes">): number {
    return guest.status === "attending" ? 1 + guest.plusOnes : 0;
}

export function isPast(event: Pick<InvitoEvent, "date" | "endDate">): boolean {
    const reference = event.endDate ?? event.date;
    return new Date(reference).getTime() < Date.now();
}

export function seatsLeft(
    event: Pick<InvitoEvent, "capacity" | "attendees">
): number | null {
    if (!event.capacity) return null;
    return Math.max(0, event.capacity - event.attendees);
}

export function isFull(
    event: Pick<InvitoEvent, "capacity" | "attendees">
): boolean {
    const left = seatsLeft(event);
    return left !== null && left <= 0;
}

export function eventTypeLabel(type: string): string {
    switch (type) {
        case "social":
            return "Social gathering";
        case "conference":
            return "Conference";
        case "workshop":
            return "Workshop";
        case "concert":
            return "Concert";
        case "wedding":
            return "Wedding";
        case "birthday":
            return "Birthday";
        case "dinner":
            return "Dinner";
        default:
            return "Gathering";
    }
}

export function rsvpStatusLabel(status: RsvpStatus): string {
    switch (status) {
        case "attending":
            return "Attending";
        case "not_attending":
            return "Declined";
        case "maybe":
            return "Maybe";
        case "waitlisted":
            return "Waitlisted";
    }
}
