"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface KairoUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    orgId: string;
    orgName: string;
}

export function useKairoUser(): KairoUser | null {
    const [user, setUser] = useState<KairoUser | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("kairo_user");
            if (raw) setUser(JSON.parse(raw));
        } catch {
            setUser(null);
        }
    }, []);

    return user;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const clearSessionAndRedirect = () => {
            document.cookie = "kairo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            router.replace("/auth/login");
        };

        const raw = localStorage.getItem("kairo_user");
        if (!raw) {
            clearSessionAndRedirect();
            return;
        }
        try {
            const user = JSON.parse(raw);
            if (!user.id || !user.orgId) {
                clearSessionAndRedirect();
            } else {
                setChecked(true);
            }
        } catch {
            clearSessionAndRedirect();
        }
    }, [router]);

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return <>{children}</>;
}
