import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-paper min-h-screen">
            <DashboardNavbar />
            <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
        </div>
    );
}
