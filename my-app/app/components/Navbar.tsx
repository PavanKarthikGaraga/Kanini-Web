"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
    const [orgName, setOrgName] = useState("");
    const [initials, setInitials] = useState("A");

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
            <div className="flex-none">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-bold">
                    {initials}
                </div>
            </div>
        </div>
    );
}
