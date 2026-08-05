export type LocationType = "physical" | "online";

export type EventStatus = "draft" | "published";

export type RsvpStatus = "attending" | "not_attending" | "maybe" | "waitlisted";

export type QuestionType = "short" | "long" | "choice";

export interface CustomQuestion {
    id: string;
    label: string;
    type: QuestionType;
    required: boolean;
    options: string[];
}

export interface InvitoEvent {
    id: string;
    title: string;
    hostName: string;
    eventType: string;
    description: string | null;
    imageUrl: string | null;

    /** ISO-8601 instant the event starts. */
    date: string;
    /** ISO-8601 instant the event ends. */
    endDate: string | null;
    /** IANA zone the host entered the times in, e.g. "Africa/Lagos". */
    timezone: string;

    location: string;
    locationType: LocationType;

    capacity: number;
    /** Confirmed heads, including plus-ones. */
    attendees: number;

    allowPlusOnes: boolean;
    maxPlusOnes: number;
    waitlistEnabled: boolean;
    guestListPublic: boolean;
    discussionEnabled: boolean;
    galleryEnabled: boolean;
    customQuestions: CustomQuestion[];

    creatorId: string;
    status: EventStatus;
    createdAt: string | null;
}

export interface Guest {
    id: string;
    name: string;
    email: string;
    status: RsvpStatus;
    plusOnes: number;
    note: string;
    answers: Record<string, string>;
    rsvpDate: string;
    phone: string;
}

/** Name-only projection of the guest list, safe to expose publicly. */
export interface PublicAttendee {
    id: string;
    firstName: string;
    plusOnes: number;
    rsvpDate: string;
}

export interface DiscussionMessage {
    id: string;
    authorName: string;
    body: string;
    createdAt: string;
    isHost: boolean;
}

export interface GalleryPhoto {
    id: string;
    url: string;
    caption: string;
    uploaderName: string;
    createdAt: string;
}

export interface Announcement {
    id: string;
    subject: string;
    body: string;
    sentAt: string;
    recipientCount: number;
    delivered: boolean;
}
