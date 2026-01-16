export default function Features() {
    return (
        <section id="features" className="py-20 bg-white dark:bg-surface-dark relative">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="flex flex-col gap-4 mb-16 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-text-main dark:text-white tracking-tight">Everything you need to host perfectly</h2>
                    <p className="text-text-secondary dark:text-gray-400 text-lg">Powerful tools wrapped in a simple design to make your event planning seamless and sophisticated.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group bg-background-light dark:bg-background-dark rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>mark_email_unread</span>
                        </div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white mb-3">Real-time RSVPs</h3>
                        <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                            Watch your guest list grow with instant notifications sent right to your phone. Know exactly who's coming.
                        </p>
                    </div>
                    <div className="group bg-background-light dark:bg-background-dark rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div className="size-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>palette</span>
                        </div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white mb-3">Beautiful Themes</h3>
                        <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                            Choose from designer-curated styles that match your vibe and impress your guests from the first click.
                        </p>
                    </div>
                    <div className="group bg-background-light dark:bg-background-dark rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div className="size-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>forum</span>
                        </div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white mb-3">Guest Messaging</h3>
                        <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                            Send updates, reminders, and thank you notes with a single click. Keep everyone in the loop effortlessly.
                        </p>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
        </section>
    )
}