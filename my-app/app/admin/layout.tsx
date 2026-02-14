"use client";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import { SuperAdminGuard } from "../components/AuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SuperAdminGuard>
            <div className="flex flex-col min-h-screen">
                <AdminNavbar />

                <div className="drawer lg:drawer-open flex-1 pt-16">
                    <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

                    <div className="drawer-content flex flex-col lg:pl-64">
                        <main className="flex-1 p-6 bg-base-200 min-h-[calc(100vh-64px)] overflow-auto">
                            {children}
                        </main>
                    </div>

                    <AdminSidebar />
                </div>
            </div>
        </SuperAdminGuard>
    );
}
