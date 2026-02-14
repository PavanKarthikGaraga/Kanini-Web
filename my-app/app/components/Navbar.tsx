"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [orgName, setOrgName] = useState("");
    const [initials, setInitials] = useState("A");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("kairo_user");
            if (raw) {
                const user = JSON.parse(raw);
                setOrgName(user.orgName || "");
                const name = user.fullName || "";
                setInitials(name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "A");
            }
        } catch { /* ignore */ }
    }, []);


    return (
        <div className="navbar bg-secondary text-secondary-content z-30 px-6">
            <div className="flex-none lg:hidden">
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost btn-sm drawer-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </label>
            </div>
            <div className="flex-1 flex items-center gap-3">
                <span className="text-lg font-bold tracking-tight">Kairo</span>
                {orgName && (
                    <>
                        <span className="text-secondary-content/20">|</span>
                        <span className="text-sm font-medium text-secondary-content/60">{orgName}</span>
                    </>
                )}
            </div>
            <div className="flex-none flex items-center gap-3">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar online">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-bold border-2 border-primary-content/20 shadow-lg ring ring-primary ring-offset-base-100 ring-offset-2">
                            {initials}
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-xl w-52 border border-base-300">
                        <div className="px-4 py-3 border-b border-base-200 mb-2 text-base-content">
                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-1">Organization</p>
                            <p className="text-sm font-semibold truncate">{orgName || "Hospice Care"}</p>
                        </div>
                        <li>
                            <Link href="/dashboard/profile" className="flex items-center gap-3 py-2 text-base-content/70 hover:text-base-content">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile Settings
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/settings" className="flex items-center gap-3 py-2 text-base-content/70 hover:text-base-content">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </Link>
                        </li>
                        <div className="h-px bg-base-200 my-2"></div>
                        <li>
                            <Link href="/auth/login" className="flex items-center gap-3 py-2 text-error hover:bg-error/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log out
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
