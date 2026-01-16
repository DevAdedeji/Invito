import Link from "next/link"

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-[#eee9f1] dark:border-gray-800 bg-surface-light/90 dark:bg-background-dark/90 backdrop-blur-md">
            <div className="mx-auto max-w-[1280px] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>celebration</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-primary dark:text-primary">Invito</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-sm font-medium text-text-main dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="#features">Features</a>
                        {/* <a className="text-sm font-medium text-text-main dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Pricing</a>
                        <a className="text-sm font-medium text-text-main dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Resources</a> */}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth" className="hidden sm:flex text-sm font-bold text-text-main dark:text-gray-200 hover:text-primary dark:hover:text-primary px-3 py-2 transition-colors">
                            Log in
                        </Link>
                        <Link href="/auth" className="flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold h-10 px-5 transition-all shadow-md hover:shadow-lg">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}