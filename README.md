# Invito - Event Management Platform

Invito is an invitation and RSVP platform built with Next.js, Firebase and Tailwind CSS. Hosts build a page that reads like a printed invitation, share one link, and manage replies from a single dashboard.

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
