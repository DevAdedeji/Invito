import * as z from "zod";
import { serverTimestamp } from "firebase/firestore";

import { isoDateInZone, isoTimeInZone, zonedWallClockToUtc } from "@/lib/datetime";
import type { InvitoEvent } from "@/lib/types";

export const questionSchema = z.object({
    id: z.string(),
    label: z.string().min(1, "Give the question a label").max(120),
    type: z.enum(["short", "long", "choice"]),
    required: z.boolean(),
    options: z.array(z.string()),
});

export const eventFormSchema = z
    .object({
        title: z.string().min(2, "Give your event a name").max(140),
        hostName: z.string().min(2, "Who is hosting?").max(120),
        eventType: z.string().min(1),
        description: z.string().max(2500, "Keep it under 2500 characters"),
        imageUrl: z.string(),

        startDate: z.date({ message: "Pick a start date" }),
        startTime: z.string().min(1, "Pick a start time"),
        endDate: z.date({ message: "Pick an end date" }),
        endTime: z.string().min(1, "Pick an end time"),
        timezone: z.string().min(1),

        locationType: z.enum(["physical", "online"]),
        location: z.string().min(2, "Where is it?"),

        capacity: z.number().int().min(0).max(100000),
        allowPlusOnes: z.boolean(),
        maxPlusOnes: z.number().int().min(0).max(20),
        waitlistEnabled: z.boolean(),
        guestListPublic: z.boolean(),
        discussionEnabled: z.boolean(),
        galleryEnabled: z.boolean(),
        customQuestions: z.array(questionSchema).max(10),

        status: z.enum(["draft", "published"]),
    })
    .refine(
        (values) =>
            toInstant(values.endDate, values.endTime, values.timezone).getTime() >
            toInstant(values.startDate, values.startTime, values.timezone).getTime(),
        { message: "The end must come after the start", path: ["endTime"] }
    );

export type EventFormValues = z.infer<typeof eventFormSchema>;

/** Local calendar day of a Date, avoiding the UTC shift `toISOString` causes. */
function localDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function toInstant(date: Date, time: string, timezone: string): Date {
    return zonedWallClockToUtc(localDateKey(date), time, timezone);
}

export function emptyEventValues(timezone: string): EventFormValues {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date(start);

    return {
        title: "",
        hostName: "",
        eventType: "social",
        description: "",
        imageUrl: "",
        startDate: start,
        startTime: "18:00",
        endDate: end,
        endTime: "22:00",
        timezone,
        locationType: "physical",
        location: "",
        capacity: 0,
        allowPlusOnes: false,
        maxPlusOnes: 1,
        waitlistEnabled: false,
        guestListPublic: false,
        discussionEnabled: false,
        galleryEnabled: false,
        customQuestions: [],
        status: "published",
    };
}

export function eventToFormValues(event: InvitoEvent): EventFormValues {
    const tz = event.timezone;
    const endIso = event.endDate ?? event.date;

    return {
        title: event.title,
        hostName: event.hostName,
        eventType: event.eventType,
        description: event.description ?? "",
        imageUrl: event.imageUrl ?? "",
        startDate: new Date(`${isoDateInZone(event.date, tz)}T00:00:00`),
        startTime: isoTimeInZone(event.date, tz),
        endDate: new Date(`${isoDateInZone(endIso, tz)}T00:00:00`),
        endTime: isoTimeInZone(endIso, tz),
        timezone: tz,
        locationType: event.locationType,
        location: event.location,
        capacity: event.capacity,
        allowPlusOnes: event.allowPlusOnes,
        maxPlusOnes: event.maxPlusOnes || 1,
        waitlistEnabled: event.waitlistEnabled,
        guestListPublic: event.guestListPublic,
        discussionEnabled: event.discussionEnabled,
        galleryEnabled: event.galleryEnabled,
        customQuestions: event.customQuestions,
        status: event.status,
    };
}

export function buildEventPayload(values: EventFormValues, creatorId: string) {
    const start = toInstant(values.startDate, values.startTime, values.timezone);
    const end = toInstant(values.endDate, values.endTime, values.timezone);

    const maxPlusOnes = values.allowPlusOnes ? values.maxPlusOnes : 0;

    return {
        title: values.title.trim(),
        hostName: values.hostName.trim(),
        eventType: values.eventType,
        description: values.description.trim() || null,
        imageUrl: values.imageUrl || null,

        date: start.toISOString(),
        endDate: end.toISOString(),
        startDateTime: start,
        endDateTime: end,
        timezone: values.timezone,

        location: values.location.trim(),
        locationType: values.locationType,

        capacity: values.capacity,

        allowPlusOnes: values.allowPlusOnes,
        maxPlusOnes,
        waitlistEnabled: values.waitlistEnabled,
        guestListPublic: values.guestListPublic,
        discussionEnabled: values.discussionEnabled,
        galleryEnabled: values.galleryEnabled,
        customQuestions: values.customQuestions.map((q) => ({
            ...q,
            label: q.label.trim(),
            options: q.type === "choice" ? q.options.filter(Boolean) : [],
        })),

        creatorId,
        status: values.status,
        updatedAt: serverTimestamp(),
    };
}

export const EVENT_TYPES = [
    { value: "social", label: "Social gathering" },
    { value: "dinner", label: "Dinner" },
    { value: "birthday", label: "Birthday" },
    { value: "wedding", label: "Wedding" },
    { value: "conference", label: "Conference" },
    { value: "workshop", label: "Workshop" },
    { value: "concert", label: "Concert" },
    { value: "other", label: "Other" },
];
