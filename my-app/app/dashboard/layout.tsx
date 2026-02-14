import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar - Full Width Top */}
            <Navbar />

            <div className="drawer lg:drawer-open flex-1">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

                <div className="drawer-content flex flex-col">
                    {/* Page Content */}
                    <main className="flex-1 p-6 bg-base-200">
                        {children}
                    </main>
                </div>

                {/* Sidebar - Below Navbar */}
                <Sidebar />
            </div>

            {/* Footer - Full Width Bottom */}
            <Footer />
        </div>
    );
}
