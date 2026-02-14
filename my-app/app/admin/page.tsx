"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
    totalOrgs: number;
    totalUsers: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalOrgs: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/tenants");
                const data = await res.json();
                if (data.tenants) {
                    setStats({
                        totalOrgs: data.tenants.length,
                        totalUsers: data.tenants.reduce((sum: number, t: { user_count: number }) => sum + (t.user_count || 0), 0),
                    });
                }
            } catch { /* ignore */ }
            setLoading(false);
        }
        fetchStats();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
                <p className="text-sm text-base-content/40 mt-1">Manage your multi-tenant platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-base-content/40 uppercase tracking-wider">Total Organizations</p>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    </div>
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        <p className="text-3xl font-bold tracking-tight">{stats.totalOrgs}</p>
                    )}
                    <p className="text-xs text-base-content/30 mt-1">Organizations on platform</p>
                </div>

                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-base-content/40 uppercase tracking-wider">Total Users</p>
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                    </div>
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        <p className="text-3xl font-bold tracking-tight">{stats.totalUsers}</p>
                    )}
                    <p className="text-xs text-base-content/30 mt-1">Across all organizations</p>
                </div>

                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-base-content/40 uppercase tracking-wider">Platform Status</p>
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight text-success">Active</p>
                    <p className="text-xs text-base-content/30 mt-1">All systems operational</p>
                </div>
            </div>

            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Quick Actions</h2>
                <div className="flex flex-col gap-2">
                    <Link href="/admin/tenants" className="bg-base-100 rounded-lg border border-base-300 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <span className="text-sm font-medium">Manage Organizations</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
