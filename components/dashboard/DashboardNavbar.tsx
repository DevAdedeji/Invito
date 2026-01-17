
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function DashboardNavbar() {
    const pathname = usePathname();
    const [user] = useAuthState(auth);

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        // { href: "/dashboard/analytics", label: "Analytics" },
        // { href: "/dashboard/contacts", label: "Contacts" },
    ];

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>celebration</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-primary dark:text-primary">Invito</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href
                                    ? "text-primary border-b-2 border-primary py-5 !font-bold"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">

                    <Link href="/dashboard/create-event">
                        <Button className="bg-primary hover:bg-primary-dark text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all hidden sm:flex">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                        </Button>
                    </Link>
                    <Avatar className="w-9 h-9 border border-border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user?.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </nav>
    );
}
