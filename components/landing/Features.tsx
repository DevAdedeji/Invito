const STEPS = [
    {
        number: "01",
        title: "Set the scene",
        body: "Title, host, date, place, a cover if you want one. A live preview shows the invitation taking shape as you type.",
    },
    {
        number: "02",
        title: "Share one link",
        body: "It unfurls properly in messages and inboxes — your event's own title, date and cover, not a generic card.",
    },
    {
        number: "03",
        title: "Watch the replies",
        body: "Accepts, maybes and regrets land in one table with plus-ones, dietary notes and anything else you asked.",
    },
];

const DETAILS = [
    {
        title: "Plus-ones, counted properly",
        body: "Let guests bring people, cap how many, and see a headcount that already includes them.",
    },
    {
        title: "Capacity and a waitlist",
        body: "Set a limit and Invito stops overselling it. Turn on the waitlist and late replies queue instead of bouncing.",
    },
    {
        title: "Ask your own questions",
        body: "Dietary needs, song requests, which session they want. Answers arrive alongside each reply.",
    },
    {
        title: "Guests can amend",
        body: "Plans change. A guest replies again with the same email and their answer updates — no account needed.",
    },
    {
        title: "A note wall and a gallery",
        body: "Optional. Let guests leave messages before, and add photos after.",
    },
    {
        title: "Export and announce",
        body: "Take the guest list as CSV, or send everyone an update without leaving the dashboard.",
    },
];

export default function Features() {
    return (
        <section id="how" className="border-rule border-t">
            <div className="mx-auto max-w-5xl px-6 py-24">
                <p className="eyebrow eyebrow-left">How it works</p>

                <div className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-10">
                    {STEPS.map((step) => (
                        <div key={step.number}>
                            <p className="meta text-seal">{step.number}</p>
                            <h3 className="font-display mt-4 text-2xl">{step.title}</h3>
                            <p className="text-ink-muted mt-3 text-sm leading-[1.75]">
                                {step.body}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-rule mt-24 border-t pt-16">
                    <p className="eyebrow eyebrow-left">The details</p>

                    <dl className="divide-rule mt-10 divide-y">
                        {DETAILS.map((detail) => (
                            <div
                                key={detail.title}
                                className="grid gap-2 py-7 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-10"
                            >
                                <dt className="font-display text-xl">{detail.title}</dt>
                                <dd className="text-ink-muted text-sm leading-[1.75]">
                                    {detail.body}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
