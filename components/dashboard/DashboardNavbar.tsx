"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/shared/ThemeToggle";
import Wordmark from "@/components/shared/Wordmark";
import { auth } from "@/lib/firebase";
import { clearSessionCookie } from "@/lib/session";

export default function DashboardNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user] = useAuthState(auth);

    const initials =
        user?.displayName
            ?.split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("") ||
        user?.email?.[0] ||
        "?";

    async function handleSignOut() {
        try {
            await signOut(auth);
            clearSessionCookie();
            router.push("/auth/login");
        } catch {
            toast.error("Couldn't sign out. Please try again.");
        }
    }

    return (
        <nav className="border-rule bg-paper/85 sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" aria-label="Invito dashboard">
                        <Wordmark />
                    </Link>

                    <Link
                        href="/dashboard"
                        className={`meta hidden transition-colors sm:inline ${pathname === "/dashboard"
                            ? "text-ink"
                            : "text-ink-faint hover:text-ink"
                            }`}
                    >
                        Events
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <Button asChild size="sm" className="hidden sm:inline-flex">
                        <Link href="/dashboard/create-event">
                            <Plus />
                            New invitation
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="ml-1 rounded-full"
                                aria-label="Account menu"
                            >
                                <Avatar className="size-9">
                                    <AvatarImage
                                        src={user?.photoURL || ""}
                                        alt={user?.displayName || "Your avatar"}
                                    />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                {user?.displayName || "Signed in"}
                            </DropdownMenuLabel>
                            {user?.email && (
                                <p className="text-ink-faint truncate px-2.5 pb-2 text-xs">
                                    {user.email}
                                </p>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild className="sm:hidden">
                                <Link href="/dashboard/create-event">
                                    <Plus />
                                    New invitation
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={handleSignOut}>
                                <LogOut />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
