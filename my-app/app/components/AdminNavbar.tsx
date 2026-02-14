"use client";

import { useEffect, useState } from "react";

export default function AdminNavbar() {
    const [initials, setInitials] = useState("SA");

    const handleLogout = () => {
        localStorage.removeItem("kairo_user");
        document.cookie = "kairo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/auth/login";
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem("kairo_user");
            if (raw) {
                const user = JSON.parse(raw);
                const name = user.fullName || "";
                setInitials(name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "SA");
            }
        } catch { /* ignore */ }
    }, []);

    return (
        <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 z-40 px-6 fixed top-0 left-0 right-0 w-full mb-0 h-16">
            <div className="flex-none lg:hidden">
                <label htmlFor="admin-drawer" className="btn btn-square btn-ghost btn-sm drawer-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </label>
            </div>
            <div className="flex-1 flex items-center gap-3">
                <span className="text-xl font-black tracking-tighter text-primary">Kairo</span>
                <span className="text-base-content/20 text-xl font-thin">/</span>
                <span className="text-sm font-bold text-base-content/60 uppercase tracking-widest">Super Admin</span>
            </div>
            <div className="flex-none flex items-center gap-3">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar online">
                        <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center text-error-content text-xs font-bold border-2 border-error-content/20 shadow-lg ring ring-error ring-offset-base-100 ring-offset-2">
                            {initials}
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-xl w-52 border border-base-300">
                        <div className="px-4 py-3 border-b border-base-200 mb-2 text-base-content">
                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-1">Role</p>
                            <p className="text-sm font-semibold truncate">Super Admin</p>
                        </div>
                        <li>
                            <button onClick={handleLogout} className="flex items-center gap-3 py-2 text-error hover:bg-error/10 w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log out
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
