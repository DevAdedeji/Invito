import Link from "next/link";

import Wordmark from "@/components/shared/Wordmark";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-paper flex min-h-screen flex-col">
            <div className="mx-auto w-full max-w-5xl px-6 py-8">
                <Link href="/" aria-label="Invito home">
                    <Wordmark />
                </Link>
            </div>

            <main className="flex flex-1 items-center justify-center px-6 pb-20">
                {children}
            </main>

            <footer className="mx-auto w-full max-w-5xl px-6 pb-10 text-center">
                <p className="text-ink-faint text-xs">
                    By continuing you agree to our terms and privacy policy.
                </p>
            </footer>
        </div>
    );
}
