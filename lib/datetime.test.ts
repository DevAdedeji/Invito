import { describe, expect, it } from "vitest";

import {
    buildIcs,
    formatTimeRange,
    isoDateInZone,
    isoTimeInZone,
    zonedWallClockToUtc,
} from "@/lib/datetime";

describe("zonedWallClockToUtc", () => {
    it("resolves a wall-clock time in a fixed-offset zone", () => {
        // Lagos is UTC+1 year round.
        const instant = zonedWallClockToUtc("2026-09-26", "19:00", "Africa/Lagos");
        expect(instant.toISOString()).toBe("2026-09-26T18:00:00.000Z");
    });

    it("treats UTC input as UTC", () => {
        const instant = zonedWallClockToUtc("2026-09-26", "19:00", "UTC");
        expect(instant.toISOString()).toBe("2026-09-26T19:00:00.000Z");
    });

    it("applies the summer offset during daylight saving", () => {
        // New York is UTC-4 in July.
        const instant = zonedWallClockToUtc("2026-07-04", "20:00", "America/New_York");
        expect(instant.toISOString()).toBe("2026-07-05T00:00:00.000Z");
    });

    it("applies the winter offset outside daylight saving", () => {
        // ...and UTC-5 in January.
        const instant = zonedWallClockToUtc("2026-01-04", "20:00", "America/New_York");
        expect(instant.toISOString()).toBe("2026-01-05T01:00:00.000Z");
    });

    it("resolves a time on the evening the clocks go back", () => {
        // US DST ends 2026-11-01. An 8pm event that evening is already on EST.
        const instant = zonedWallClockToUtc("2026-11-01", "20:00", "America/New_York");
        expect(instant.toISOString()).toBe("2026-11-02T01:00:00.000Z");
    });

    it("resolves a time on the morning the clocks go forward", () => {
        // US DST starts 2026-03-08; 10am is already on EDT.
        const instant = zonedWallClockToUtc("2026-03-08", "10:00", "America/New_York");
        expect(instant.toISOString()).toBe("2026-03-08T14:00:00.000Z");
    });

    it("handles zones with a half-hour offset", () => {
        const instant = zonedWallClockToUtc("2026-09-26", "19:00", "Asia/Kolkata");
        expect(instant.toISOString()).toBe("2026-09-26T13:30:00.000Z");
    });

    it("handles a zone ahead of the date line", () => {
        const instant = zonedWallClockToUtc("2026-09-26", "09:00", "Asia/Tokyo");
        expect(instant.toISOString()).toBe("2026-09-26T00:00:00.000Z");
    });

    it("round-trips back to the wall clock the host entered", () => {
        const cases: [string, string, string][] = [
            ["2026-09-26", "19:00", "Africa/Lagos"],
            ["2026-07-04", "20:30", "America/New_York"],
            ["2026-01-15", "08:15", "Europe/London"],
            ["2026-12-31", "23:45", "Australia/Sydney"],
        ];

        for (const [date, time, zone] of cases) {
            const iso = zonedWallClockToUtc(date, time, zone).toISOString();
            expect(isoDateInZone(iso, zone), `${date} ${time} ${zone}`).toBe(date);
            expect(isoTimeInZone(iso, zone), `${date} ${time} ${zone}`).toBe(time);
        }
    });

    it("keeps midnight on the correct calendar day", () => {
        const iso = zonedWallClockToUtc("2026-09-26", "00:00", "Africa/Lagos").toISOString();
        expect(isoDateInZone(iso, "Africa/Lagos")).toBe("2026-09-26");
        expect(isoTimeInZone(iso, "Africa/Lagos")).toBe("00:00");
    });
});

describe("formatTimeRange", () => {
    it("shows only the time for a same-day range", () => {
        const start = "2026-09-26T18:00:00.000Z";
        const end = "2026-09-26T22:00:00.000Z";
        const range = formatTimeRange(start, end, "Africa/Lagos");

        expect(range).toContain("7:00 PM");
        expect(range).toContain("11:00 PM");
        expect(range).not.toContain("Sep 27");
    });

    it("includes the date when the event runs past midnight", () => {
        const start = "2026-09-26T22:00:00.000Z";
        const end = "2026-09-27T02:00:00.000Z";
        const range = formatTimeRange(start, end, "Africa/Lagos");

        expect(range).toContain("Sep 27");
    });

    it("omits the dash when there is no end time", () => {
        const range = formatTimeRange("2026-09-26T18:00:00.000Z", null, "Africa/Lagos");
        expect(range).toContain("7:00 PM");
        expect(range).not.toContain("–");
    });
});

describe("buildIcs", () => {
    const base = {
        uid: "abc123",
        title: "Supper on the Terrace",
        description: "Dinner, then dancing.",
        location: "12 Marina, Lagos",
        url: "https://invito.test/events/abc123",
        startIso: "2026-09-26T18:00:00.000Z",
        endIso: "2026-09-26T22:00:00.000Z",
        organizer: "Ada Obi",
    };

    it("emits a well-formed calendar with CRLF line endings", () => {
        const ics = buildIcs(base);

        expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
        expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
        expect(ics).toContain("DTSTART:20260926T180000Z");
        expect(ics).toContain("DTEND:20260926T220000Z");
    });

    it("escapes characters that are structural in the ics format", () => {
        const ics = buildIcs({
            ...base,
            title: "Dinner, dancing; and more",
            description: "Line one\nLine two",
        });

        expect(ics).toContain("SUMMARY:Dinner\\, dancing\\; and more");
        expect(ics).toContain("Line one\\nLine two");
    });

    it("defaults to a two-hour event when no end time is set", () => {
        const ics = buildIcs({ ...base, endIso: null });
        expect(ics).toContain("DTEND:20260926T200000Z");
    });

    it("folds lines to the length the spec allows", () => {
        const ics = buildIcs({ ...base, description: "x".repeat(400) });
        const tooLong = ics.split("\r\n").filter((line) => line.length > 75);
        expect(tooLong).toEqual([]);
    });

    it("marks continuation lines with a leading space", () => {
        const ics = buildIcs({ ...base, description: "y".repeat(200) });
        const lines = ics.split("\r\n");
        const descIndex = lines.findIndex((l) => l.startsWith("DESCRIPTION:"));

        expect(lines[descIndex + 1].startsWith(" ")).toBe(true);
    });
});
