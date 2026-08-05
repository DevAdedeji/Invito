# Invito - Event Management Platform

Invito is an invitation and RSVP platform built with Next.js, Firebase and Tailwind CSS. Hosts build a page that reads like a printed invitation, share one link, and manage replies from a single dashboard.

**[See a sample invitation →](/demo)** — the guest-facing page, with plus-ones, custom questions, a capacity counter and a note wall. No account needed.

## 🚀 Features

-   **Server-rendered invitation pages**: Shared links unfurl in messages and inboxes with the event's own title, date and a generated cover image.
-   **RSVPs without an account**: Guests accept, decline or answer "maybe" — and can amend their reply later using the same email address.
-   **Plus-ones**: Optional, capped per guest, and counted into the headcount.
-   **Capacity and waitlist**: Set a limit and Invito refuses to oversell it; enable the waitlist and late replies queue instead of bouncing.
-   **Custom questions**: Ask for dietary needs, song requests or anything else; answers arrive with each reply.
-   **Optional guest sections**: A public guest list (first names only), a note wall and a photo gallery.
-   **Calendar**: `.ics` download plus a Google Calendar link.
-   **Timezone-correct times**: Events store a UTC instant and an IANA zone, so every guest reads the wall-clock time the host entered.
-   **Host dashboard**: Upcoming/past/draft views, search, live headcount, edit, duplicate and delete.
-   **Guest list tools**: CSV export and a blind-copied announcement email to attendees.
-   **Light and dark themes** across every surface.

## 🧭 Engineering decisions

The four problems in this codebase that took real thought, and how they were resolved.

### The guest list could be harvested by anyone with the link

Guest documents hold names, email addresses and free-text answers. The obvious
model — one `guests` subcollection under each event — collides with the fact
that RSVPs have no login: the client must be able to write there anonymously.
The original rules resolved that with `allow read, write: if true`, which meant
anyone holding an event link could list every guest, or overwrite their replies.

The fix separates the two operations Firestore treats as one. `list` is
host-only, so the collection cannot be enumerated. `get` stays open, but each
document's id is a SHA-256 of the guest's own email address
([`lib/guest-id.ts`](lib/guest-id.ts)) — so a guest can reach their own reply to
amend it, while nobody can discover anyone else's.

**Residual exposure, stated plainly:** somebody who knows both an event id *and*
a specific person's email address can read that person's RSVP. That is the price
of amend-without-an-account. The upgrade path is a signed token emailed on first
reply, used as the document key instead of the email hash, which removes the
guessable component entirely.

A public guest list is a separate `attendees_public` projection holding first
names and plus-one counts only, so turning it on can never expose an address.
The rules reject any write to it carrying extra keys.

### The attendee counter could be set to any number

Public RSVPs have to move the headcount, so the counter must be writable
anonymously. The original rule checked *which* field changed but not its value,
so `attendees: 999999` was accepted.

It now validates the transition rather than the field: the delta is bounded by
`1 + maxPlusOnes`, the result cannot go negative, and it cannot exceed capacity.
The client mirrors the same bound so a legitimate write is never rejected.

### Capacity is a race, not a display value

Two guests loading the page while one seat remains would both see "1 place left"
and both be accepted. [`submitRsvp`](lib/rsvp.ts) therefore re-reads the event
immediately before writing rather than trusting the render-time copy, and the
decision itself lives in a pure function
([`lib/rsvp-policy.ts`](lib/rsvp-policy.ts)) so the capacity, waitlist and
amendment arithmetic can be tested without a database.

The subtle case is amendment: a guest already holding three seats who changes
their plus-one count must be measured against capacity *minus their own existing
booking*, or they get rejected by their own reservation.

### Why RSVP writes go through the client

Server-side writes would need `firebase-admin` and a service-account credential.
Doing it from the client with the web SDK keeps deployment to a single set of
public config values, and pushes authorisation into security rules — where it is
declarative, and where it can be tested (see below).

The tradeoff is that every constraint has to be expressible in the rules
language. Where that isn't enough — sending email, signing uploads — there are
route handlers instead ([`app/api`](app/api)).

## 🧪 Tests

```bash
npm test          # pure logic: capacity, timezones, normalisation, CSV
npm run test:rules  # security rules against the Firestore emulator
```

The unit tests cover the parts where being subtly wrong is invisible: DST
transitions and half-hour offsets in [`lib/datetime.ts`](lib/datetime.ts), the
back-compat normaliser that keeps pre-redesign documents rendering
([`lib/events.ts`](lib/events.ts)), the capacity and waitlist arithmetic, and
CSV escaping including spreadsheet formula injection.

The rules tests ([`tests/rules`](tests/rules)) assert the security properties
directly — that an anonymous visitor holding an event link cannot list the guest
collection, that the attendee counter rejects an arbitrary jump, and that the
public guest list stays closed until the host opts in.

`npm run test:rules` needs the Firestore emulator, which needs a JDK
(`brew install openjdk`).

## ✉️ Optional: sending announcements

Messaging guests works without any configuration — Invito opens a pre-filled mail draft with everyone blind-copied. To send directly from the app instead, set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
-   **Image Storage**: [Cloudinary](https://cloudinary.com/)
-   **Date Handling**: [date-fns](https://date-fns.org/)
-   **Toast Notifications**: [Sonner](https://github.com/emilkowalski/sonner)

## 📦 Getting Started

### Prerequisites

-   Node.js 18+ installed
-   A Firebase project
-   A Cloudinary account

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/devadedeji/invito.git
    cd invito
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**

    Create a `.env` file in the root directory and add your keys:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
    CLOUDINARY_API_SECRET=your_api_secret
    CLOUDINARY_API_KEY=your_api_key

    # Optional — only needed to send guest announcements from the app itself
    RESEND_API_KEY=your_resend_key
    RESEND_FROM_EMAIL=invites@yourdomain.com
    ```

4.  **Set up Firestore Rules:**

    Copy the contents of `firestore.rules` and publish them in your Firebase Console > Firestore Database > Rules.

    This is required, not optional: the rules are what keep guest lists from
    being enumerated by anyone holding an event link, and what stop the
    attendee counter from being set to an arbitrary value.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
