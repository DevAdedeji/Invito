import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CTA() {
    return (
        <section className="border-rule border-t">
            <div className="mx-auto max-w-2xl px-6 py-28 text-center">
                <p className="eyebrow justify-center">Ready when you are</p>

                <h2 className="font-display mt-8 text-4xl leading-[1.08] text-balance sm:text-5xl">
                    Your next gathering deserves better than a group chat.
                </h2>

                <p className="text-ink-muted mx-auto mt-6 max-w-md text-[15px] leading-[1.75]">
                    Build the invitation in a few minutes, send one link, and let the
                    replies organise themselves.
                </p>

                <div className="mt-10">
                    <Button asChild size="lg">
                        <Link href="/auth/signup">Create an invitation</Link>
                    </Button>
                </div>

                <p className="meta text-ink-faint mt-6">Free to start</p>
            </div>
        </section>
    );
}
