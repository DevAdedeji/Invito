
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20">
            <DashboardNavbar />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
