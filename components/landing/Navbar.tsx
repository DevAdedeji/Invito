"use client";

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";

import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/ThemeToggle";
import Wordmark from "@/components/shared/Wordmark";
import { auth } from "@/lib/firebase";

export default function Navbar() {
    const [user] = useAuthState(auth);

    return (
        <nav className="border-rule bg-paper/85 sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
                <Link href="/" aria-label="Invito home">
                    <Wordmark />
                </Link>

                <div className="flex items-center gap-2">
                    <a
                        href="#how"
                        className="meta text-ink-muted hover:text-ink mr-4 hidden transition-colors sm:inline"
                    >
                        How it works
                    </a>
                    <ThemeToggle />
                    {user ? (
                        <Button asChild size="sm">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="hidden sm:inline-flex"
                            >
                                <Link href="/auth/login">Sign in</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/auth/signup">Start free</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
