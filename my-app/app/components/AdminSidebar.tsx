"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            label: "Dashboard",
            href: "/admin",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            label: "Organizations",
            href: "/admin/tenants",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
    ];

    return (
        <div className="drawer-side z-30 h-[calc(100vh-64px)] fixed top-16">
            <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="flex flex-col min-h-full w-64 bg-base-100 border-r border-base-300 overflow-y-auto">
                <ul className="menu flex-1 px-3 gap-1 text-sm w-full">
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${pathname === item.href
                                    ? "bg-primary text-primary-content font-semibold shadow-lg shadow-primary/20"
                                    : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                                {pathname === item.href && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-content"></span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="p-4 mt-auto">
                    <div className="bg-base-200 rounded-2xl p-4 border border-base-300">
                        <p className="text-xs font-semibold text-base-content/40 uppercase mb-2">Platform</p>
                        <p className="text-xs text-base-content/50">Kairo Super Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
