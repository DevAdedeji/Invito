export default function CTA() {
    return (
        <section className="py-24 px-6">
            <div className="mx-auto max-w-5xl bg-primary rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
                            </pattern>
                        </defs>
                        <rect fill="url(#grid)" height="100%" width="100%"></rect>
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight max-w-2xl">
                        Ready to host your best event yet?
                    </h2>
                    <p className="text-white/80 text-lg max-w-xl">
                        Join thousands of hosts creating memorable experiences with Evently. It's free to get started.
                    </p>
                    <button className="mt-4 bg-white text-primary hover:bg-gray-100 text-lg font-bold py-4 px-10 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                        Start Planning Now
                    </button>
                    <p className="text-white/60 text-sm mt-2">No credit card required</p>
                </div>
            </div>
        </section>
    )
}