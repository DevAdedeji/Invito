# Invito - Event Management Platform

Invito is a modern, full-stack event management platform built with Next.js, Firebase, and Tailwind CSS. It allows users to create, manage, and share events seamlessly, with features like public RSVP pages, real-time guest tracking, and email invitations.

## 🚀 Features

-   **User Authentication**: Secure login and signup powered by Firebase Authentication.
-   **Dashboard**: A centralized hub to manage all your events, track RSVPs, and view analytics.
-   **Create & Customize Events**: Effortlessly create events with custom details, including:
    -   Event Title, Date, and Time
    -   Location (Physical or Online)
    -   Cover Image Upload (via Cloudinary)
    -   Description and Capacity
-   **Public RSVP Pages**: Generate unique, shareable links for public events.
    -   Guests can RSVP (Attending, Not Attending, Maybe).
    -   Real-time attendee counter.
    -   Add to Calendar (Google Calendar) integration.
    -   Location mapping (Google Maps integration).
-   **Guest Management**:
    -   View and filter guest lists by status.
    -   Search guests by name or email.
    -   Real-time updates.
-   **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
-   **Dark Mode Support**: Beautiful dark mode UI with Shadcn components.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
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
    ```

4.  **Set up Firestore Rules:**

    Copy the contents of `firestore.rules` and publish them in your Firebase Console > Firestore Database > Rules to ensure correct permissions.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
