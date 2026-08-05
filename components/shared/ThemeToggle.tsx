"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    // Both icons render on the server and CSS picks one, so there is no
    // hydration mismatch and no mounted flag to gate on.
    return (
        <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle colour theme"
        >
            <Moon className="size-4 dark:hidden" />
            <Sun className="hidden size-4 dark:block" />
        </Button>
    );
}
