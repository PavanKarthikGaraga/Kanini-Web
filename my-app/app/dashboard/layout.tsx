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
            <Navbar />

            <div className="drawer lg:drawer-open flex-1">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

                <div className="drawer-content flex flex-col">
                    <main className="flex-1 p-6 bg-base-200">
                        {children}
                    </main>
                    <Footer />
                </div>

                <Sidebar />
            </div>
        </div>
    );
}
