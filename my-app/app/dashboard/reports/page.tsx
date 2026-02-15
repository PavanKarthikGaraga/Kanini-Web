"use client";

import { useEffect, useState } from "react";

interface Stats {
    totalPatients: number;
    avgConfidence: number;
    riskDistribution: Record<string, number>;
    weeklyAdmissions: { day: string; admissions: number }[];
    departmentStats: { name: string; patients: number }[];
}

export default function ReportsPage() {
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

    const total = stats?.totalPatients || 0;
    const riskDist = stats?.riskDistribution || { High: 0, Medium: 0, Low: 0 };
    const weeklyData = stats?.weeklyAdmissions || [];
    const maxAdmissions = Math.max(...weeklyData.map((d) => d.admissions), 1);

    const riskItems = [
        { label: "High Risk", count: riskDist.High || 0, color: "bg-error" },
        { label: "Medium Risk", count: riskDist.Medium || 0, color: "bg-warning" },
        { label: "Low Risk", count: riskDist.Low || 0, color: "bg-success" },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                    <p className="text-sm text-base-content/40 mt-1">Analytics and performance metrics</p>
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
                        <p className="text-2xl font-bold tracking-tight">{total}</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Patients</p>
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight text-error">{riskDist.High || 0}</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High Risk</p>
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight text-warning">{riskDist.Medium || 0}</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Medium Risk</p>
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        <p className="text-2xl font-bold tracking-tight text-info">{stats?.avgConfidence ?? 0}%</p>
                        <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Triage Accuracy</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Weekly Admissions</h2>
                    {loading ? (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-5 h-48 animate-pulse">
                            <div className="h-full bg-base-300 rounded"></div>
                        </div>
                    ) : (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                            <div className="flex items-end gap-3 h-40">
                                {weeklyData.map((d) => (
                                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center gap-1" style={{ height: "120px" }}>
                                            <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                                                <div
                                                    className="w-5 bg-primary/20 rounded-t"
                                                    style={{ height: `${(d.admissions / maxAdmissions) * 100}%`, minHeight: d.admissions > 0 ? "4px" : "0" }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[10px] text-base-content/30">{d.day}</span>
                                            <p className="text-[9px] text-base-content/20">{d.admissions}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Risk Distribution</h2>
                    {loading ? (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-5 animate-pulse">
                            <div className="h-6 bg-base-300 rounded w-full mb-4"></div>
                            <div className="h-6 bg-base-300 rounded w-full mb-4"></div>
                            <div className="h-6 bg-base-300 rounded w-full"></div>
                        </div>
                    ) : (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                            <div className="flex flex-col gap-4">
                                {riskItems.map((item) => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-base-content/60">{item.label}</span>
                                            <span className="text-xs text-base-content/30">{item.count} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-base-200 rounded-full h-2">
                                            <div className={`${item.color} h-2 rounded-full`} style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Department Performance</h2>
                {loading ? (
                    <div className="bg-base-100 rounded-lg border border-base-300 p-8 animate-pulse">
                        <div className="h-4 bg-base-300 rounded w-full mb-3"></div>
                        <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    </div>
                ) : !stats?.departmentStats?.length ? (
                    <div className="bg-base-100 rounded-lg border border-base-300 p-8">
                        <div className="flex flex-col items-center justify-center text-base-content/20">
                            <p className="text-xs">No department data yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                        <table className="table text-sm">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                                    <th>Department</th>
                                    <th>Patients</th>
                                    <th>Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.departmentStats.map((dept) => (
                                    <tr key={dept.name} className="hover border-base-300/50">
                                        <td className="font-medium">{dept.name}</td>
                                        <td className="text-base-content/50">{dept.patients}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-base-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-primary"
                                                        style={{ width: `${total > 0 ? (dept.patients / total) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-base-content/40">{total > 0 ? Math.round((dept.patients / total) * 100) : 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
