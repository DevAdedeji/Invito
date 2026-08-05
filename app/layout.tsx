import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = "https://invito.adedeji.xyz";

export const metadata: Metadata = {
  title: {
    default: "Invito — Invitations worth opening",
    template: "%s · Invito",
  },
  description:
    "Create an invitation people actually want to open, share one link, and watch the replies come in. Free to start.",
  keywords: ["invitations", "RSVP", "event planning", "guest list", "Invito"],
  authors: [{ name: "Invito" }],
  creator: "Invito",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Invito — Invitations worth opening",
    description:
      "Create an invitation people actually want to open, share one link, and watch the replies come in.",
    siteName: "Invito",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invito — Invitations worth opening",
    description:
      "Create an invitation people actually want to open, share one link, and watch the replies come in.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
