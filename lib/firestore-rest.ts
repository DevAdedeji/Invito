import { normalizeEvent, normalizePublicAttendee } from "@/lib/events";
import type { InvitoEvent, PublicAttendee } from "@/lib/types";

/**
 * Server-side reads over the Firestore REST API.
 *
 * The invite page has to be server-rendered so shared links unfurl and carry
 * per-event OG tags. Using REST instead of firebase-admin keeps this working
 * with the public web API key already in the environment — no service-account
 * credentials to provision. Security rules still apply: these requests are
 * unauthenticated, so only data the rules mark publicly readable comes back.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type FirestoreValue = Record<string, unknown>;

interface FirestoreDocument {
    name: string;
    fields?: Record<string, FirestoreValue>;
    createTime?: string;
    updateTime?: string;
}

function decodeValue(value: FirestoreValue): unknown {
    if ("nullValue" in value) return null;
    if ("stringValue" in value) return value.stringValue;
    if ("booleanValue" in value) return value.booleanValue;
    if ("integerValue" in value) return Number(value.integerValue);
    if ("doubleValue" in value) return Number(value.doubleValue);
    if ("timestampValue" in value) return value.timestampValue;
    if ("referenceValue" in value) return value.referenceValue;
    if ("arrayValue" in value) {
        const inner = value.arrayValue as { values?: FirestoreValue[] };
        return (inner.values ?? []).map(decodeValue);
    }
    if ("mapValue" in value) {
        const inner = value.mapValue as { fields?: Record<string, FirestoreValue> };
        return decodeFields(inner.fields);
    }
    return null;
}

function decodeFields(
    fields: Record<string, FirestoreValue> | undefined
): Record<string, unknown> {
    if (!fields) return {};
    return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, decodeValue(value)])
    );
}

function docId(name: string): string {
    return name.split("/").pop() ?? "";
}

function configured(): boolean {
    return Boolean(PROJECT_ID && API_KEY);
}

export async function fetchEventServer(
    eventId: string,
    revalidate = 15
): Promise<InvitoEvent | null> {
    if (!configured()) return null;

    const url = `${BASE}/events/${encodeURIComponent(eventId)}?key=${API_KEY}`;

    let response: Response;
    try {
        response = await fetch(url, { next: { revalidate } });
    } catch {
        return null;
    }

    if (!response.ok) return null;

    const doc = (await response.json()) as FirestoreDocument;
    if (!doc?.name) return null;

    return normalizeEvent(docId(doc.name), decodeFields(doc.fields));
}

export async function fetchPublicAttendeesServer(
    eventId: string,
    revalidate = 15
): Promise<PublicAttendee[]> {
    if (!configured()) return [];

    const url = `${BASE}/events/${encodeURIComponent(
        eventId
    )}/attendees_public?key=${API_KEY}&pageSize=300`;

    let response: Response;
    try {
        response = await fetch(url, { next: { revalidate } });
    } catch {
        return [];
    }

    if (!response.ok) return [];

    const body = (await response.json()) as { documents?: FirestoreDocument[] };
    return (body.documents ?? []).map((doc) =>
        normalizePublicAttendee(docId(doc.name), decodeFields(doc.fields))
    );
}
