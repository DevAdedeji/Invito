import { readFileSync } from "node:fs";
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const HOST = "host-uid";
const OTHER_HOST = "other-host-uid";
const EVENT = "event-1";

let testEnv: RulesTestEnvironment;

/** A guest document id — in the app this is a SHA-256 of the guest's email. */
const ADA = "hash-of-ada-email";
const BOLA = "hash-of-bola-email";

const baseEvent = {
    title: "Supper on the Terrace",
    hostName: "Ada Obi",
    eventType: "social",
    date: "2099-09-26T18:00:00.000Z",
    location: "12 Marina, Lagos",
    locationType: "physical",
    capacity: 10,
    attendees: 2,
    allowPlusOnes: true,
    maxPlusOnes: 2,
    waitlistEnabled: false,
    guestListPublic: false,
    discussionEnabled: false,
    galleryEnabled: false,
    customQuestions: [],
    creatorId: HOST,
    status: "published",
};

const validGuest = {
    name: "Ada Obi",
    email: "ada@example.com",
    status: "attending",
    plusOnes: 1,
    note: "",
    answers: {},
    rsvpDate: "2026-09-01T10:00:00.000Z",
};

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "invito-test",
        firestore: {
            rules: readFileSync("firestore.rules", "utf8"),
            host: "127.0.0.1",
            port: 8080,
        },
    });
});

afterAll(async () => {
    await testEnv?.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, "events", EVENT), baseEvent);
        await setDoc(doc(db, "events", EVENT, "guests", ADA), validGuest);
        await setDoc(doc(db, "events", EVENT, "guests", BOLA), {
            ...validGuest,
            name: "Bola Ade",
            email: "bola@example.com",
            plusOnes: 0,
        });
        await setDoc(doc(db, "events", EVENT, "attendees_public", ADA), {
            firstName: "Ada",
            plusOnes: 1,
            rsvpDate: "2026-09-01T10:00:00.000Z",
        });
    });
});

const anon = () => testEnv.unauthenticatedContext().firestore();
const host = () => testEnv.authenticatedContext(HOST).firestore();
const stranger = () => testEnv.authenticatedContext(OTHER_HOST).firestore();

describe("events", () => {
    it("lets anyone read the invitation — that is the point of a share link", async () => {
        await assertSucceeds(getDoc(doc(anon(), "events", EVENT)));
    });

    it("stops a signed-in stranger editing someone else's event", async () => {
        await assertFails(
            updateDoc(doc(stranger(), "events", EVENT), { title: "Hijacked" })
        );
    });

    it("stops an anonymous visitor editing the event", async () => {
        await assertFails(
            updateDoc(doc(anon(), "events", EVENT), { title: "Hijacked" })
        );
    });

    it("lets the host edit their own event", async () => {
        await assertSucceeds(
            updateDoc(doc(host(), "events", EVENT), { title: "Renamed" })
        );
    });

    it("only lets the host delete the event", async () => {
        await assertFails(deleteDoc(doc(stranger(), "events", EVENT)));
        await assertSucceeds(deleteDoc(doc(host(), "events", EVENT)));
    });

    it("refuses an event created with a forged owner", async () => {
        await assertFails(
            setDoc(doc(stranger(), "events", "forged"), {
                ...baseEvent,
                attendees: 0,
                creatorId: HOST,
            })
        );
    });

    it("refuses a new event that starts with attendees on the board", async () => {
        await assertFails(
            setDoc(doc(host(), "events", "prefilled"), {
                ...baseEvent,
                creatorId: HOST,
                attendees: 50,
            })
        );
    });
});

describe("the attendee counter", () => {
    it("accepts a legal nudge from a public RSVP", async () => {
        await assertSucceeds(
            updateDoc(doc(anon(), "events", EVENT), { attendees: 3 })
        );
    });

    it("accepts a decrement when a guest withdraws", async () => {
        await assertSucceeds(
            updateDoc(doc(anon(), "events", EVENT), { attendees: 1 })
        );
    });

    it("refuses an arbitrary jump", async () => {
        // The old rule checked only *which* key changed, so this was allowed.
        await assertFails(
            updateDoc(doc(anon(), "events", EVENT), { attendees: 9999 })
        );
    });

    it("refuses a value beyond the event's capacity", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(
                doc(context.firestore(), "events", EVENT),
                { ...baseEvent, attendees: 10 }
            );
        });

        await assertFails(
            updateDoc(doc(anon(), "events", EVENT), { attendees: 11 })
        );
    });

    it("refuses a negative count", async () => {
        await assertFails(
            updateDoc(doc(anon(), "events", EVENT), { attendees: -1 })
        );
    });

    it("refuses a counter change smuggled alongside another field", async () => {
        await assertFails(
            updateDoc(doc(anon(), "events", EVENT), {
                attendees: 3,
                capacity: 100000,
            })
        );
    });
});

describe("the guest list", () => {
    it("cannot be enumerated by an anonymous visitor holding the link", async () => {
        // The headline guarantee: knowing the event id must not yield the
        // names and email addresses of everyone who replied.
        await assertFails(getDocs(collection(anon(), "events", EVENT, "guests")));
    });

    it("cannot be enumerated by a signed-in stranger either", async () => {
        await assertFails(getDocs(collection(stranger(), "events", EVENT, "guests")));
    });

    it("can be enumerated by the host", async () => {
        await assertSucceeds(getDocs(collection(host(), "events", EVENT, "guests")));
    });

    it("lets a guest fetch their own reply by its derived id", async () => {
        // Documented tradeoff: the id is a hash of the guest's own email, so a
        // guest can amend without an account. Reaching it requires knowing the
        // address; the collection still cannot be listed.
        await assertSucceeds(getDoc(doc(anon(), "events", EVENT, "guests", ADA)));
    });

    it("only lets the host remove a guest", async () => {
        await assertFails(deleteDoc(doc(anon(), "events", EVENT, "guests", ADA)));
        await assertSucceeds(deleteDoc(doc(host(), "events", EVENT, "guests", ADA)));
    });
});

describe("submitting an RSVP", () => {
    const newGuest = "hash-of-chidi-email";

    it("accepts a well-formed reply from an anonymous guest", async () => {
        await assertSucceeds(
            setDoc(doc(anon(), "events", EVENT, "guests", newGuest), {
                ...validGuest,
                name: "Chidi Eze",
                email: "chidi@example.com",
            })
        );
    });

    it("accepts an amendment to an existing reply", async () => {
        await assertSucceeds(
            setDoc(doc(anon(), "events", EVENT, "guests", ADA), {
                ...validGuest,
                status: "not_attending",
                plusOnes: 0,
            })
        );
    });

    it("refuses more plus-ones than the host allows", async () => {
        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "guests", newGuest), {
                ...validGuest,
                plusOnes: 5,
            })
        );
    });

    it("refuses plus-ones on an event that does not permit them", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), "events", EVENT), {
                ...baseEvent,
                allowPlusOnes: false,
                maxPlusOnes: 0,
            });
        });

        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "guests", newGuest), {
                ...validGuest,
                plusOnes: 1,
            })
        );
    });

    it("refuses an invented status", async () => {
        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "guests", newGuest), {
                ...validGuest,
                status: "vip",
            })
        );
    });

    it("refuses a nameless reply", async () => {
        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "guests", newGuest), {
                ...validGuest,
                name: "",
            })
        );
    });

    it("refuses an oversized note", async () => {
        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "guests", newGuest), {
                ...validGuest,
                note: "x".repeat(501),
            })
        );
    });
});

describe("the public guest list", () => {
    it("stays hidden while the host keeps it private", async () => {
        await assertFails(
            getDocs(collection(anon(), "events", EVENT, "attendees_public"))
        );
    });

    it("becomes readable once the host opts in", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), "events", EVENT), {
                ...baseEvent,
                guestListPublic: true,
            });
        });

        await assertSucceeds(
            getDocs(collection(anon(), "events", EVENT, "attendees_public"))
        );
    });

    it("is visible to the host even while private", async () => {
        await assertSucceeds(
            getDocs(collection(host(), "events", EVENT, "attendees_public"))
        );
    });

    it("refuses an entry carrying an email address", async () => {
        // The whole point of this projection is that it holds no contact data.
        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "attendees_public", "x"), {
                firstName: "Chidi",
                plusOnes: 0,
                rsvpDate: "2026-09-01T10:00:00.000Z",
                email: "chidi@example.com",
            })
        );
    });

    it("refuses removal while the underlying reply is still attending", async () => {
        await assertFails(
            deleteDoc(doc(anon(), "events", EVENT, "attendees_public", ADA))
        );
    });

    it("allows removal once the guest has withdrawn", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await setDoc(doc(context.firestore(), "events", EVENT, "guests", ADA), {
                ...validGuest,
                status: "not_attending",
            });
        });

        await assertSucceeds(
            deleteDoc(doc(anon(), "events", EVENT, "attendees_public", ADA))
        );
    });
});

describe("the note wall", () => {
    it("is closed while the host has not enabled it", async () => {
        await assertFails(getDocs(collection(anon(), "events", EVENT, "messages")));
        await assertFails(
            setDoc(doc(anon(), "events", EVENT, "messages", "m1"), {
                authorName: "Ada",
                body: "Looking forward to it",
                isHost: false,
                createdAt: "2026-09-01T10:00:00.000Z",
            })
        );
    });

    describe("once enabled", () => {
        beforeEach(async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), "events", EVENT), {
                    ...baseEvent,
                    discussionEnabled: true,
                });
            });
        });

        it("accepts a note from a guest", async () => {
            await assertSucceeds(
                setDoc(doc(anon(), "events", EVENT, "messages", "m1"), {
                    authorName: "Ada",
                    body: "Looking forward to it",
                    isHost: false,
                    createdAt: "2026-09-01T10:00:00.000Z",
                })
            );
        });

        it("refuses an empty note", async () => {
            await assertFails(
                setDoc(doc(anon(), "events", EVENT, "messages", "m2"), {
                    authorName: "Ada",
                    body: "",
                    isHost: false,
                    createdAt: "2026-09-01T10:00:00.000Z",
                })
            );
        });

        it("does not let a guest rewrite a posted note", async () => {
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(
                    doc(context.firestore(), "events", EVENT, "messages", "m3"),
                    {
                        authorName: "Ada",
                        body: "Original",
                        isHost: false,
                        createdAt: "2026-09-01T10:00:00.000Z",
                    }
                );
            });

            await assertFails(
                updateDoc(doc(anon(), "events", EVENT, "messages", "m3"), {
                    body: "Edited",
                })
            );
        });
    });
});

describe("announcements", () => {
    it("are invisible to guests and strangers", async () => {
        await assertFails(
            getDocs(collection(anon(), "events", EVENT, "announcements"))
        );
        await assertFails(
            getDocs(collection(stranger(), "events", EVENT, "announcements"))
        );
    });

    it("are readable and writable by the host", async () => {
        await assertSucceeds(
            setDoc(doc(host(), "events", EVENT, "announcements", "a1"), {
                subject: "A small change",
                body: "We start at 8pm now.",
                sentAt: "2026-09-01T10:00:00.000Z",
                recipientCount: 12,
                delivered: true,
            })
        );
        await assertSucceeds(
            getDocs(collection(host(), "events", EVENT, "announcements"))
        );
    });
});
