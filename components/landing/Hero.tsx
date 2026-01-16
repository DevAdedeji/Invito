export default function Hero() {
    return (
        <header className="relative overflow-hidden pt-12 pb-20">
            <div className="mx-auto max-w-[1280px] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="flex flex-col gap-6 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left z-10">
                        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit mx-auto lg:mx-0">
                            <span className="text-xs font-bold uppercase tracking-wide">New Feature</span>
                            <span className="h-1 w-1 rounded-full bg-primary"></span>
                            <span className="text-xs font-medium">AI-Generated Themes</span>
                        </div> */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-text-main dark:text-white">
                            Planning your next celebration shouldn't be a <span className="text-primary relative inline-block">
                                chore
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/40" preserveAspectRatio="none" viewBox="0 0 100 10">
                                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                </svg>
                            </span>
                        </h1>
                        <p className="text-lg text-text-secondary dark:text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Create beautiful event pages, track RSVPs in real-time, and manage guests effortlessly. All the tools you need in one sophisticated dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center lg:justify-start">
                            <button className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white text-base font-bold h-12 px-8 transition-all shadow-soft hover:scale-105 active:scale-95">
                                Create My Event - Free
                            </button>
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-main dark:text-gray-200 text-base font-bold h-12 px-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>play_circle</span>
                                Watch Demo
                            </button>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-4 mt-6 text-sm text-text-secondary dark:text-gray-500">
                            <div className="flex -space-x-2">
                                <img alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark object-cover" data-alt="Small avatar of a smiling woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFenvZkgOZ5mC80BonCRo9nBSZvn85_DPx9cOg25cT4NNnh4cTMdet6THJIbc-clBZJGUHMOGEpVAZg9JoVmAgwE2sS0ZEaiLcRZ7hwZ-NsM-xgSAqSJGCis9RH9oqtaA2HZR3C_uq7F6_YCksGdCu5D2_hnbTzCCRTeuZAT-fimA827ELeqQvYi1ed0WfdF4Or25CrzJIPzZbZLTtmyHUNiZ0trg5HUM-AQRmDUmEAdxBReT9QmNelBQl0oQ8qFEepXy-GcDzJ1km" />
                                <img alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark object-cover" data-alt="Small avatar of a smiling man" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpwZ1YmYd23O93bVYUqoSR_mvQBg7tT1CpqwHcs5_WObRS0G34tkoP0p_lWI5yDVmp06gnfnDFmFhNmxxVKR9FQo5l6SK1C1UQieFpbH7xRgubMiBi7IBfshylUs7ZxO9mQMUh-0QF96Mn-rIaJTzpQcKB-LHZQ-Jr58BuC76pHUaQooalXKIoiqs2W1Z4seRIDqOEnyJtb1gHDwDzsV0yQA2iowIvg-XB3FHpjBw0fJOF9jVPIVLVbBUvEfV_MyuHrnMgCnbJoKxx" />
                                <img alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark object-cover" data-alt="Small avatar of a man with glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBby20m6NC13AG-73MAHrKRHwvnQ2gn6Lz3rEdgSumLD6CxmBu-1cYodKPSqCvqt5HbzkAdDlIV7nGZiChqr0-VegEOuWc06Sb-nGkRdK2gBqXcjcnNlekle7qUhS5qqS6N1cYTmm0ldhGKS80LHEkbUj0zew-Fb-Ho7CLy1MVCq1G4xh0I1D0wHyowzvCRoZhpVaLX7pQmZMV4o2qss4FKRlKoMls6bfQ3SFManD9En3M1WdwlhY2vW_M2BALJYCJdw59wC3XBqn5U" />
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+2k</div>
                            </div>
                            <p>Trusted by 10,000+ hosts</p>
                        </div>
                    </div>
                    <div className="relative mx-auto lg:mx-0 w-full max-w-[400px] lg:max-w-none perspective-1000">
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                        <div className="absolute bottom-10 -left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10"></div>
                        <div className="relative z-10 bg-white dark:bg-surface-dark rounded-[2.5rem] p-3 shadow-2xl border-4 border-gray-100 dark:border-gray-800 rotate-y-12 rotate-x-6 transform transition-transform duration-500 hover:rotate-0">
                            <div className="bg-white dark:bg-surface-dark rounded-[2rem] overflow-hidden h-[580px] border border-gray-100 dark:border-gray-800 flex flex-col relative">
                                <div className="h-48 w-full bg-cover bg-center relative" data-alt="Birthday party celebration with friends holding sparklers" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlRPIe7Lt1C6CG1mtFqb8vIMFQvsdArNIr3pSCISV4-GFAGbb_17YnOCDsDVIHFQwoYrj-qINkmIeR9BZQFMgMe4ls-C0VnOnmE2RrN1vgkAEWG2igKLF4brxodxD9yIBX10QAzAhMVBZbf_wZ0K8t5RHA0XsdMIyoKs3MpXqEvR0l-mjOXSXZ1XQ5v8XeMe9dcza3l6HHHDNNEVYFr6nBuuY8_XDh0hCRgrnO-LZrAf8iyiS3X5tTcYPXncKq5xKuuwKi-YPMw2ps')" }}>
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold text-text-main shadow-sm">
                                            Sep 24
                                        </div>
                                        <div className="size-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-gray-600 text-sm">favorite</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main dark:text-white leading-tight">Sarah's 30th Birthday Bash</h3>
                                        <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                            The Rooftop Garden, NYC
                                        </p>
                                    </div>
                                    <div className="flex gap-2 my-2">
                                        <span className="px-3 py-1 rounded-full bg-purple-50 text-primary text-xs font-bold">Dinner</span>
                                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">Music</span>
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">Drinks</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-text-main dark:text-gray-200">Guest List</span>
                                            <span className="text-xs text-primary font-bold cursor-pointer">View All</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800"></div>
                                                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800"></div>
                                                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800"></div>
                                            </div>
                                            <div className="text-xs text-text-secondary font-medium">18 Attending</div>
                                        </div>
                                    </div>
                                    <button className="mt-auto w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30">
                                        RSVP Now
                                    </button>
                                </div>
                                <div className="absolute top-1/2 -right-4 bg-white dark:bg-surface-dark p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-bounce">
                                    <div className="size-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                        <span className="material-symbols-outlined text-sm">notifications_active</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-text-main dark:text-white">New RSVP!</span>
                                        <span className="text-[10px] text-text-secondary">Alex just joined</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}