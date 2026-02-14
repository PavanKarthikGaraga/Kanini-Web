"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AuthGuard from "../components/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex flex-col min-h-screen">
                <Navbar />

                <div className="drawer lg:drawer-open flex-1 pt-16">
                    <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

                    <div className="drawer-content flex flex-col lg:pl-64">
                        <main className="flex-1 p-6 bg-base-200 min-h-[calc(100vh-64px)] overflow-auto">
                            {children}
                        </main>
                    </div>

                    <Sidebar />
                </div>
            </div>
        </AuthGuard>
    );
}
