"use client";

import { useEffect, useState } from "react";

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

        // Load saved theme preference
        const savedTheme = localStorage.getItem("kairo_theme");
        if (savedTheme === "kairo-dark") {
            setIsDark(true);
            document.documentElement.setAttribute("data-theme", "kairo-dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? "kairo" : "kairo-dark";
        setIsDark(!isDark);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("kairo_theme", newTheme);
    };

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
                <button
                    onClick={toggleTheme}
                    className="btn btn-ghost btn-sm btn-square"
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-bold">
                    {initials}
                </div>
            </div>
        </div>
    );
}
