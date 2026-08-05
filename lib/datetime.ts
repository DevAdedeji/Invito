/**
 * Timezone-correct formatting without pulling in a tz database.
 * Everything is stored as a UTC instant; the event's IANA zone decides how it
 * gets rendered, so a guest in Lagos and a guest in Berlin read the same
 * wall-clock time the host typed.
 */

function partsInZone(ts: number, timeZone: string) {
    const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    const map: Record<string, string> = {};
    for (const part of dtf.formatToParts(new Date(ts))) {
        map[part.type] = part.value;
    }
    return map;
}

function zoneOffsetMs(ts: number, timeZone: string): number {
    const p = partsInZone(ts, timeZone);
    const asUtc = Date.UTC(
        Number(p.year),
        Number(p.month) - 1,
        Number(p.day),
        Number(p.hour) % 24,
        Number(p.minute),
        Number(p.second)
    );
    return asUtc - ts;
}

/**
 * Turns a wall-clock date + time in `timeZone` into the UTC instant it refers
 * to. Refines once so times that fall near a DST transition land correctly.
 */
export function zonedWallClockToUtc(
    datePart: string,
    timePart: string,
    timeZone: string
): Date {
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = timePart.split(":").map(Number);
    const guess = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);

    const firstOffset = zoneOffsetMs(guess, timeZone);
    let ts = guess - firstOffset;
    const secondOffset = zoneOffsetMs(ts, timeZone);
    if (secondOffset !== firstOffset) ts = guess - secondOffset;

    return new Date(ts);
}

/** `2026-08-05` as read in `timeZone`. */
export function isoDateInZone(iso: string, timeZone: string): string {
    const p = partsInZone(new Date(iso).getTime(), timeZone);
    return `${p.year}-${p.month}-${p.day}`;
}

/** `19:30` as read in `timeZone`. */
export function isoTimeInZone(iso: string, timeZone: string): string {
    const p = partsInZone(new Date(iso).getTime(), timeZone);
    return `${String(Number(p.hour) % 24).padStart(2, "0")}:${p.minute}`;
}

export function formatInZone(
    iso: string,
    timeZone: string,
    options: Intl.DateTimeFormatOptions
): string {
    return new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(
        new Date(iso)
    );
}

/** "Saturday, September 24" */
export function formatLongDate(iso: string, timeZone: string): string {
    return formatInZone(iso, timeZone, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

/** "Sep 24, 2026" */
export function formatShortDate(iso: string, timeZone: string): string {
    return formatInZone(iso, timeZone, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** "7:00 PM" */
export function formatTime(iso: string, timeZone: string): string {
    return formatInZone(iso, timeZone, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

/** "GMT+1" — appended so guests in other zones aren't misled. */
export function formatZoneAbbreviation(iso: string, timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short",
    }).formatToParts(new Date(iso));
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

/** "7:00 PM – 11:00 PM GMT+1" */
export function formatTimeRange(
    startIso: string,
    endIso: string | null,
    timeZone: string
): string {
    const zone = formatZoneAbbreviation(startIso, timeZone);
    const start = formatTime(startIso, timeZone);
    if (!endIso) return `${start} ${zone}`.trim();

    const sameDay =
        isoDateInZone(startIso, timeZone) === isoDateInZone(endIso, timeZone);
    const end = sameDay
        ? formatTime(endIso, timeZone)
        : `${formatShortDate(endIso, timeZone)}, ${formatTime(endIso, timeZone)}`;

    return `${start} – ${end} ${zone}`.trim();
}

/** "in 3 days" / "2 hours ago" */
export function formatRelative(iso: string): string {
    const diffMs = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 31_536_000_000],
        ["month", 2_592_000_000],
        ["week", 604_800_000],
        ["day", 86_400_000],
        ["hour", 3_600_000],
        ["minute", 60_000],
    ];

    for (const [unit, ms] of units) {
        if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit);
    }
    return "just now";
}

export function browserTimeZone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}

const FALLBACK_ZONES = [
    "UTC",
    "Africa/Lagos",
    "Africa/Cairo",
    "Africa/Johannesburg",
    "Africa/Nairobi",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/New_York",
    "America/Sao_Paulo",
    "America/Toronto",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/Berlin",
    "Europe/Lisbon",
    "Europe/London",
    "Europe/Madrid",
    "Europe/Paris",
];

export function supportedTimeZones(): string[] {
    const withValues = Intl as typeof Intl & {
        supportedValuesOf?: (key: string) => string[];
    };
    try {
        const zones = withValues.supportedValuesOf?.("timeZone");
        if (zones?.length) return zones;
    } catch {
        // Older engines: fall through.
    }
    return FALLBACK_ZONES;
}

function icsEscape(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n");
}

function icsStamp(iso: string): string {
    return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Folds long lines to the 75-octet limit RFC 5545 requires. */
function fold(line: string): string {
    if (line.length <= 73) return line;
    const chunks: string[] = [line.slice(0, 73)];
    let rest = line.slice(73);
    while (rest.length > 72) {
        chunks.push(` ${rest.slice(0, 72)}`);
        rest = rest.slice(72);
    }
    if (rest) chunks.push(` ${rest}`);
    return chunks.join("\r\n");
}

export function buildIcs(input: {
    uid: string;
    title: string;
    description: string;
    location: string;
    url: string;
    startIso: string;
    endIso: string | null;
    organizer: string;
}): string {
    const end =
        input.endIso ??
        new Date(new Date(input.startIso).getTime() + 2 * 60 * 60 * 1000).toISOString();

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Invito//Invitations//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${input.uid}@invito`,
        `DTSTAMP:${icsStamp(new Date().toISOString())}`,
        `DTSTART:${icsStamp(input.startIso)}`,
        `DTEND:${icsStamp(end)}`,
        `SUMMARY:${icsEscape(input.title)}`,
        `DESCRIPTION:${icsEscape(input.description)}`,
        `LOCATION:${icsEscape(input.location)}`,
        `URL:${icsEscape(input.url)}`,
        `ORGANIZER;CN=${icsEscape(input.organizer)}:MAILTO:noreply@invito.app`,
        "END:VEVENT",
        "END:VCALENDAR",
    ];

    return lines.map(fold).join("\r\n");
}

export function googleCalendarUrl(input: {
    title: string;
    description: string;
    location: string;
    startIso: string;
    endIso: string | null;
}): string {
    const end =
        input.endIso ??
        new Date(new Date(input.startIso).getTime() + 2 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: input.title,
        dates: `${icsStamp(input.startIso)}/${icsStamp(end)}`,
        details: input.description,
        location: input.location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
