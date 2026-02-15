"use client";

import { useEffect, useState, useCallback } from "react";

interface QueuePatient {
    patient_id: string;
    priority_score: number;
    risk_level: string;
    position: number;
}

interface DepartmentQueue {
    size: number;
    patients: QueuePatient[];
}

interface DbPatient {
    id: number;
    patient_id_display: string;
    age: number;
    gender: string;
    symptoms: string;
    risk_level: string;
    recommended_department: string;
    urgency_score: number;
    status: string;
    created_at: string;
}

export default function LiveQueuePage() {
    const [mlQueues, setMlQueues] = useState<Record<string, DepartmentQueue>>({});
    const [dbPatients, setDbPatients] = useState<DbPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [mlConnected, setMlConnected] = useState(false);
    const [selectedDept, setSelectedDept] = useState<string>("all");

    const fetchData = useCallback(async () => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        // Fetch ML queue summary
        try {
            const mlRes = await fetch("/api/queue");
            if (mlRes.ok) {
                const data = await mlRes.json();
                // Validate that we got a department dictionary (not an error or single queue object)
                if (data && typeof data === "object" && !data.error && !data.department) {
                    setMlQueues(data);
                    setMlConnected(true);
                } else {
                    setMlQueues({});
                    setMlConnected(false);
                }
            }
        } catch {
            setMlConnected(false);
        }

        // Also fetch DB patients for context
        if (orgId) {
            try {
                const dbRes = await fetch("/api/patients", {
                    headers: { "x-org-id": orgId },
                });
                if (dbRes.ok) {
                    const data = await dbRes.json();
                    if (Array.isArray(data)) setDbPatients(data);
                }
            } catch { /* ignore */ }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        // Poll every 10 seconds for live updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const allQueuePatients = Object.entries(mlQueues).flatMap(([dept, q]) =>
        (q?.patients || []).map((p) => ({ ...p, department: dept }))
    );
    const totalInQueue = allQueuePatients.length;
    const highRiskCount = allQueuePatients.filter((p) => p.risk_level === "High").length;
    const departments = Object.keys(mlQueues).filter((d) => mlQueues[d].size > 0);

    const displayPatients = selectedDept === "all"
        ? allQueuePatients.sort((a, b) => b.priority_score - a.priority_score)
        : (mlQueues[selectedDept]?.patients || []).map((p) => ({ ...p, department: selectedDept }));

    // Fallback to DB patients if ML queue is empty
    const showDbFallback = !mlConnected || totalInQueue === 0;
    const pendingDb = dbPatients.filter((p) => p.status === "Pending");

    const riskBadge = (risk: string) => {
        const cls = risk === "High" ? "bg-error/10 text-error" : risk === "Medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
        return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cls}`}>{risk}</span>;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Live Queue</h1>
                    <p className="text-sm text-base-content/40 mt-1">Real-time ML-powered patient priority queue</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 text-xs ${mlConnected ? "text-success" : "text-error"}`}>
                        <span className={`w-2 h-2 rounded-full ${mlConnected ? "bg-success animate-pulse" : "bg-error"}`}></span>
                        {mlConnected ? "ML Connected" : "ML Offline"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{showDbFallback ? dbPatients.length : totalInQueue}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total in Queue</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-primary">{showDbFallback ? new Set(dbPatients.map(p => p.recommended_department)).size : departments.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Active Depts</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-warning">{showDbFallback ? pendingDb.length : totalInQueue}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Awaiting</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-error">{showDbFallback ? dbPatients.filter(p => p.risk_level === "High").length : highRiskCount}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High Risk</p>
                </div>
            </div>

            {/* Department filter tabs */}
            {!showDbFallback && departments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setSelectedDept("all")}
                        className={`btn btn-xs rounded-full ${selectedDept === "all" ? "btn-primary" : "btn-ghost"}`}
                    >
                        All ({totalInQueue})
                    </button>
                    {departments.map((dept) => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`btn btn-xs rounded-full ${selectedDept === dept ? "btn-primary" : "btn-ghost"}`}
                        >
                            {dept} ({mlQueues[dept].size})
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
            ) : showDbFallback && dbPatients.length === 0 ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12">
                    <div className="flex flex-col items-center justify-center text-base-content/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs">No patients in queue</p>
                    </div>
                </div>
            ) : showDbFallback ? (
                /* Fallback to DB-based queue */
                <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                    <table className="table text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                                <th>Patient ID</th>
                                <th>Age / Gender</th>
                                <th>Symptoms</th>
                                <th>Risk</th>
                                <th>Department</th>
                                <th>Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dbPatients.map((p) => (
                                <tr key={p.id} className="hover border-base-300/50">
                                    <td className="font-medium font-mono text-xs">{p.patient_id_display}</td>
                                    <td className="text-base-content/50">{p.age} / {p.gender}</td>
                                    <td className="text-base-content/50 max-w-[200px] truncate">{p.symptoms}</td>
                                    <td>{riskBadge(p.risk_level)}</td>
                                    <td className="text-base-content/50 text-xs">{p.recommended_department}</td>
                                    <td className="font-mono text-xs">{p.urgency_score}/100</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* ML Queue table */
                <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                    <table className="table text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                                <th>#</th>
                                <th>Patient ID</th>
                                <th>Department</th>
                                <th>Risk</th>
                                <th>Priority Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayPatients.map((p, i) => (
                                <tr key={`${p.patient_id}-${i}`} className="hover border-base-300/50">
                                    <td className="text-base-content/30 text-xs">{i + 1}</td>
                                    <td className="font-medium font-mono text-xs">{p.patient_id}</td>
                                    <td className="text-base-content/50 text-xs">{p.department}</td>
                                    <td>{riskBadge(p.risk_level)}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <progress className={`progress ${p.priority_score >= 70 ? "progress-error" : p.priority_score >= 40 ? "progress-warning" : "progress-success"} w-20 h-2`} value={p.priority_score} max="100"></progress>
                                            <span className="font-mono text-xs font-semibold">{p.priority_score.toFixed(1)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
