import { formatShortDate, formatTime } from "@/lib/datetime";
import { rsvpStatusLabel } from "@/lib/events";
import type { CustomQuestion, Guest } from "@/lib/types";

function escapeCell(value: string): string {
    // Prefix formula-leading characters so spreadsheets treat them as text.
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
}

export function guestsToCsv(
    guests: Guest[],
    questions: CustomQuestion[],
    timezone: string
): string {
    const headers = [
        "Name",
        "Email",
        "Status",
        "Plus ones",
        "Total heads",
        "Replied on",
        "Note",
        ...questions.map((q) => q.label),
    ];

    const rows = guests.map((guest) => [
        guest.name,
        guest.email,
        rsvpStatusLabel(guest.status),
        String(guest.plusOnes),
        String(guest.status === "attending" ? 1 + guest.plusOnes : 0),
        `${formatShortDate(guest.rsvpDate, timezone)} ${formatTime(guest.rsvpDate, timezone)}`,
        guest.note,
        ...questions.map((q) => guest.answers[q.id] ?? ""),
    ]);

    return [headers, ...rows]
        .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
        .join("\r\n");
}

export function downloadCsv(filename: string, contents: string) {
    // The BOM keeps Excel from mangling non-ASCII names.
    const blob = new Blob([`﻿${contents}`], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
