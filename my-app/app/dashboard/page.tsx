"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
    totalPatients: number;
    newThisWeek: number;
    pendingCount: number;
    recentPatients: {
        id: string;
        patient_id_display: string;
        risk_level: string;
        recommended_department: string;
        created_at: string;
    }[];
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        if (!orgId) { setLoading(false); return; }

        fetch("/api/stats", { headers: { "x-org-id": orgId } })
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const riskBadge = (risk: string) => {
        const cls = risk === "High" ? "bg-error/10 text-error" : risk === "Medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
        return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cls}`}>{risk}</span>;
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                <p className="text-sm text-base-content/40 mt-1">Welcome back to your dashboard</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-5 animate-pulse">
                            <div className="h-3 bg-base-300 rounded w-24 mb-4"></div>
                            <div className="h-8 bg-base-300 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-base-content/40 uppercase tracking-wider">Total Patients</p>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">{stats?.totalPatients ?? 0}</p>
                        <p className="text-xs text-base-content/30 mt-1">All time</p>
                    </div>

                    <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-base-content/40 uppercase tracking-wider">New Registrations</p>
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">{stats?.newThisWeek ?? 0}</p>
                        <p className="text-xs text-base-content/30 mt-1">This week</p>
                    </div>

                    <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-base-content/40 uppercase tracking-wider">Pending</p>
                            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight">{stats?.pendingCount ?? 0}</p>
                        <p className="text-xs text-base-content/30 mt-1">Awaiting triage</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Recent Activity</h2>
                    {loading ? (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-8 animate-pulse">
                            <div className="h-4 bg-base-300 rounded w-full mb-3"></div>
                            <div className="h-4 bg-base-300 rounded w-3/4"></div>
                        </div>
                    ) : !stats?.recentPatients?.length ? (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-8">
                            <div className="flex flex-col items-center justify-center text-base-content/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                <p className="text-xs">No recent activity</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {stats.recentPatients.map((p) => (
                                <Link key={p.id} href={`/dashboard/patient-result/${p.id}`} className="bg-base-100 rounded-lg border border-base-300 p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs font-medium">{p.patient_id_display}</span>
                                        {riskBadge(p.risk_level)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-base-content/30">
                                        <span>{p.recommended_department}</span>
                                        <span>{timeAgo(p.created_at)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Quick Actions</h2>
                    <div className="flex flex-col gap-2">
                        <Link href="/dashboard/patients" className="bg-base-100 rounded-lg border border-base-300 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                            <span className="text-sm font-medium">Register New Patient</span>
                        </Link>
                        <Link href="/dashboard/pages" className="bg-base-100 rounded-lg border border-base-300 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            </div>
                            <span className="text-sm font-medium">Start Triage Assessment</span>
                        </Link>
                        <Link href="/dashboard/reports" className="bg-base-100 rounded-lg border border-base-300 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <span className="text-sm font-medium">View Reports</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
