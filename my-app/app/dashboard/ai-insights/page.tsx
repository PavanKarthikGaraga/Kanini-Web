"use client";

import { useEffect, useState } from "react";

interface Insight {
    title: string;
    description: string;
    type: string;
    time: string;
}

interface Stats {
    avgConfidence: number;
    assessments30d: number;
    escalationCount: number;
    insights: Insight[];
    departmentStats: { name: string; patients: number }[];
}

export default function AIInsightsPage() {
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

    const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
        alert: { bg: "bg-error/10", text: "text-error", label: "Alert" },
        trend: { bg: "bg-info/10", text: "text-info", label: "Trend" },
        report: { bg: "bg-primary/10", text: "text-primary", label: "Report" },
        success: { bg: "bg-success/10", text: "text-success", label: "Improvement" },
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
                    <p className="text-sm text-base-content/40 mt-1">Automated analysis and recommendations</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-base-content/30">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Model active
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-4 animate-pulse">
                            <div className="h-7 bg-base-300 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-base-300 rounded w-24"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight">{stats?.avgConfidence ?? 0}%</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Triage Accuracy</p>
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight">{stats?.assessments30d ?? 0}</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Assessments (30d)</p>
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight">{stats?.departmentStats?.length ?? 0}</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Active Departments</p>
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight text-warning">{stats?.escalationCount ?? 0}</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Escalations</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-5 animate-pulse">
                            <div className="h-4 bg-base-300 rounded w-48 mb-3"></div>
                            <div className="h-3 bg-base-300 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : !stats?.insights?.length ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-8">
                    <div className="flex flex-col items-center justify-center text-base-content/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <p className="text-xs">No insights yet. Add patients to generate AI insights.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {stats.insights.map((insight, i) => {
                        const style = typeStyles[insight.type] || typeStyles.report;
                        return (
                            <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-sm">{insight.title}</h3>
                                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                                            {style.label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-base-content/30 shrink-0 ml-4">{insight.time}</span>
                                </div>
                                <p className="text-sm text-base-content/50 leading-relaxed">{insight.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
