import { describe, expect, it } from "vitest";

import { guestsToCsv } from "@/lib/csv";
import type { CustomQuestion, Guest } from "@/lib/types";

function guest(overrides: Partial<Guest> = {}): Guest {
    return {
        id: "g1",
        name: "Ada Obi",
        email: "ada@example.com",
        status: "attending",
        plusOnes: 0,
        note: "",
        answers: {},
        rsvpDate: "2026-09-01T10:00:00.000Z",
        phone: "",
        ...overrides,
    };
}

const rows = (csv: string) => csv.split("\r\n");

describe("guestsToCsv", () => {
    it("writes a header and one row per guest", () => {
        const csv = guestsToCsv([guest(), guest({ id: "g2" })], [], "UTC");
        expect(rows(csv)).toHaveLength(3);
    });

    it("appends a column per custom question and fills the answers", () => {
        const questions: CustomQuestion[] = [
            { id: "q1", label: "Meal", type: "choice", required: true, options: [] },
            { id: "q2", label: "Song", type: "short", required: false, options: [] },
        ];

        const csv = guestsToCsv(
            [guest({ answers: { q1: "Fish", q2: "Anything loud" } })],
            questions,
            "UTC"
        );

        const [header, row] = rows(csv);
        expect(header).toContain('"Meal"');
        expect(header).toContain('"Song"');
        expect(row).toContain('"Fish"');
        expect(row).toContain('"Anything loud"');
    });

    it("leaves unanswered questions blank rather than undefined", () => {
        const questions: CustomQuestion[] = [
            { id: "q1", label: "Meal", type: "short", required: false, options: [] },
        ];

        const csv = guestsToCsv([guest()], questions, "UTC");
        expect(rows(csv)[1]).toContain('""');
        expect(csv).not.toContain("undefined");
    });

    it("escapes embedded quotes by doubling them", () => {
        const csv = guestsToCsv([guest({ name: 'Ada "The Host" Obi' })], [], "UTC");
        expect(rows(csv)[1]).toContain('"Ada ""The Host"" Obi"');
    });

    it("keeps a comma inside a field from splitting the row", () => {
        const csv = guestsToCsv([guest({ note: "Allergic to nuts, shellfish" })], [], "UTC");
        expect(rows(csv)).toHaveLength(2);
        expect(csv).toContain('"Allergic to nuts, shellfish"');
    });

    it("keeps a newline inside a note quoted rather than breaking the row", () => {
        const csv = guestsToCsv([guest({ note: "Line one\nLine two" })], [], "UTC");
        expect(csv).toContain('"Line one\nLine two"');
    });

    it("neutralises spreadsheet formula injection", () => {
        // A guest name beginning with = would otherwise execute on open.
        const csv = guestsToCsv(
            [guest({ name: "=cmd|'/c calc'!A1", note: "+1234", email: "-2+3" })],
            [],
            "UTC"
        );

        expect(csv).toContain(`"'=cmd|'/c calc'!A1"`);
        expect(csv).toContain(`"'+1234"`);
        expect(csv).toContain(`"'-2+3"`);
    });

    it("reports the heads a guest accounts for", () => {
        const csv = guestsToCsv(
            [guest({ status: "attending", plusOnes: 2 })],
            [],
            "UTC"
        );
        // Plus ones, then total heads.
        expect(rows(csv)[1]).toContain('"2","3"');
    });

    it("counts zero heads for a guest who declined", () => {
        const csv = guestsToCsv(
            [guest({ status: "not_attending", plusOnes: 2 })],
            [],
            "UTC"
        );
        expect(rows(csv)[1]).toContain('"2","0"');
    });

    it("writes a header even when there are no guests", () => {
        const csv = guestsToCsv([], [], "UTC");
        expect(rows(csv)).toHaveLength(1);
        expect(csv).toContain('"Name"');
    });
});
