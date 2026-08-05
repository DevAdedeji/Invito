import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <header className="mx-auto max-w-5xl px-6 pt-20 pb-24 sm:pt-28">
            <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
                <div>
                    <p className="eyebrow eyebrow-left">Invitations &amp; RSVPs</p>

                    <h1 className="font-display mt-8 text-5xl leading-[1.02] text-balance sm:text-6xl">
                        An invitation worth
                        <span className="text-seal"> opening</span>.
                    </h1>

                    <p className="text-ink-muted mt-7 max-w-md text-[15px] leading-[1.75]">
                        Most event pages look like a form. Invito gives your gathering a
                        page that reads like a printed invitation — then quietly handles
                        the guest list, the plus-ones and the replies behind it.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-3">
                        <Button asChild size="lg">
                            <Link href="/auth/signup">Create an invitation</Link>
                        </Button>
                        <Button asChild variant="subtle" size="lg">
                            <Link href="/demo">See a live example</Link>
                        </Button>
                    </div>

                    <p className="meta text-ink-faint mt-8">
                        Free to start · No card required
                    </p>
                </div>

                <Link
                    href="/demo"
                    className="group block"
                    aria-label="Open the sample invitation"
                >
                    <SampleInvitation />
                </Link>
            </div>
        </header>
    );
}

function SampleInvitation() {
    return (
        <div className="relative mx-auto w-full max-w-sm">
            <div className="border-rule group-hover:border-rule-strong bg-paper-raised relative border px-9 py-12 text-center transition-colors">
                <div className="border-rule pointer-events-none absolute inset-3 border" />

                <p className="eyebrow justify-center">You&rsquo;re invited</p>

                <h2 className="font-display mt-8 text-4xl leading-[1.05]">
                    Supper on the
                    <br />
                    Terrace
                </h2>

                <p className="text-ink-muted mt-5 text-sm">
                    Hosted by{" "}
                    <span className="text-ink decoration-seal/50 underline decoration-1 underline-offset-4">
                        Ada Obi
                    </span>
                </p>

                <div className="border-rule mt-9 space-y-4 border-t pt-7">
                    <div>
                        <p className="meta text-ink-faint">When</p>
                        <p className="mt-1.5 text-sm">Saturday, 26 September</p>
                        <p className="text-ink-muted text-sm">7:00 – 11:00 PM</p>
                    </div>
                    <div>
                        <p className="meta text-ink-faint">Where</p>
                        <p className="mt-1.5 text-sm">12 Marina, Lagos</p>
                    </div>
                </div>

                <div className="border-rule mt-8 border-t pt-7">
                    <p className="meta text-seal">Kindly reply</p>
                    <div className="divide-rule mt-4 divide-y text-left">
                        <p className="font-display flex items-center gap-3 py-2.5 text-base">
                            <span className="border-seal bg-seal flex size-3.5 items-center justify-center rounded-full border">
                                <span className="bg-paper size-1 rounded-full" />
                            </span>
                            Joyfully accepts
                        </p>
                        <p className="font-display text-ink-faint flex items-center gap-3 py-2.5 text-base">
                            <span className="border-rule-strong size-3.5 rounded-full border" />
                            Regretfully declines
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
