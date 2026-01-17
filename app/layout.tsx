import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "material-symbols/outlined.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";



const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Invito - Modern Event Management Platform",
    template: "%s | Invito",
  },
  description: "Create, manage, and share events with ease. Invito provides a seamless experience for RSVPs, guest tracking, and event planning.",
  keywords: ["Event Management", "RSVP", "Event Planner", "Invito", "Next.js", "React", "Firebase"],
  authors: [{ name: "Invito Team" }],
  creator: "Invito",
  metadataBase: new URL('https://invito.adedeji.xyz'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://invito.adedeji.xyz",
    title: "Invito - Modern Event Management Platform",
    description: "The easiest way to manage your events. Create beautiful invitations, track RSVPs, and manage guests in one place.",
    siteName: "Invito",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invito Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invito - Event Management Made Simple",
    description: "Create, manage, and share events effortlessly with Invito.",
    images: ["/og-image.png"],
    creator: "@invitoapp",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <QueryProvider>
          {children}
        </QueryProvider>
      </body >
    </html >
  );
}
