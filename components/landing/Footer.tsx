import Link from "next/link";

import Wordmark from "@/components/shared/Wordmark";

export default function Footer() {
    return (
        <footer className="border-rule border-t">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row">
                <Link href="/" aria-label="Invito home">
                    <Wordmark />
                </Link>

                <p className="meta text-ink-faint">
                    © {new Date().getFullYear()} Invito
                </p>
            </div>
        </footer>
    );
}
