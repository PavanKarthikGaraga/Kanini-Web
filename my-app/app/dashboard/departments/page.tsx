"use client";

import { useEffect, useState, useCallback } from "react";

interface QueuePatient {
    patient_id: string;
    priority_score: number;
    risk_level: string;
    position: number;
}

interface DbPatient {
    id: string;
    patient_id_display: string;
    risk_level: string;
    urgency_score: number;
    recommended_department: string;
    status: string;
}

interface DepartmentData {
    name: string;
    patients: number;
    highRisk: number;
    avgPriority: number;
    queuePatients: QueuePatient[];
}

const ALL_DEPARTMENTS = [
    "Cardiology", "Emergency", "General Medicine", "Neurology",
    "Pulmonology", "Gastroenterology", "Pediatrics",
    "Nephrology", "Oncology", "Orthopedics"
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [mlConnected, setMlConnected] = useState(false);
    const [dataSource, setDataSource] = useState<"ml" | "db">("ml");

    const buildFromDb = useCallback((patients: DbPatient[]): DepartmentData[] => {
        const deptMap: Record<string, DbPatient[]> = {};
        for (const p of patients) {
            const dept = p.recommended_department || "General Medicine";
            if (!deptMap[dept]) deptMap[dept] = [];
            deptMap[dept].push(p);
        }

        // Include all known departments + any new ones from DB
        const allNames = new Set([...ALL_DEPARTMENTS, ...Object.keys(deptMap)]);

        return Array.from(allNames).map((name) => {
            const pts = deptMap[name] || [];
            return {
                name,
                patients: pts.length,
                highRisk: pts.filter((p) => p.risk_level === "High").length,
                avgPriority: pts.length > 0
                    ? pts.reduce((sum, p) => sum + (p.urgency_score || 0), 0) / pts.length
                    : 0,
                queuePatients: pts.map((p, i) => ({
                    patient_id: p.patient_id_display,
                    priority_score: p.urgency_score || 0,
                    risk_level: p.risk_level,
                    position: i + 1,
                })),
            };
        }).sort((a, b) => b.patients - a.patients);
    }, []);

    const fetchQueues = useCallback(async () => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        // Try ML backend first
        try {
            const res = await fetch("/api/queue");
            if (res.ok) {
                const summary = await res.json();
                // Check if ML actually has data
                const hasData = Object.values(summary).some((q: unknown) => {
                    const queue = q as { size?: number };
                    return queue?.size && queue.size > 0;
                });

                if (hasData) {
                    setMlConnected(true);
                    setDataSource("ml");
                    const depts: DepartmentData[] = ALL_DEPARTMENTS.map((name) => {
                        const queue = summary[name];
                        const patients = queue?.patients || [];
                        return {
                            name,
                            patients: queue?.size || 0,
                            highRisk: patients.filter((p: QueuePatient) => p.risk_level === "High").length,
                            avgPriority: patients.length > 0
                                ? patients.reduce((sum: number, p: QueuePatient) => sum + p.priority_score, 0) / patients.length
                                : 0,
                            queuePatients: patients,
                        };
                    });
                    setDepartments(depts);
                    setLoading(false);
                    return;
                }
            }
        } catch {
            // ML offline, fall through to DB
        }

        // Fallback: fetch from database
        setMlConnected(false);
        if (orgId) {
            try {
                const dbRes = await fetch("/api/patients", { headers: { "x-org-id": orgId } });
                if (dbRes.ok) {
                    const patients: DbPatient[] = await dbRes.json();
                    if (Array.isArray(patients)) {
                        setDataSource("db");
                        setDepartments(buildFromDb(patients));
                        setLoading(false);
                        return;
                    }
                }
            } catch {
                // DB also failed
            }
        }

        // Both failed
        setDataSource("db");
        setDepartments(ALL_DEPARTMENTS.map((name) => ({
            name, patients: 0, highRisk: 0, avgPriority: 0, queuePatients: [],
        })));
        setLoading(false);
    }, [buildFromDb]);

    useEffect(() => {
        fetchQueues();
        const interval = setInterval(fetchQueues, 10000);
        return () => clearInterval(interval);
    }, [fetchQueues]);

    const totalPatients = departments.reduce((sum, d) => sum + d.patients, 0);
    const totalHighRisk = departments.reduce((sum, d) => sum + d.highRisk, 0);
    const activeDepts = departments.filter((d) => d.patients > 0).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                    <p className="text-sm text-base-content/40 mt-1">
                        {dataSource === "ml" ? "Live department queues from ML triage engine" : "Department data from patient database"}
                    </p>
                </div>
                <div className={`flex items-center gap-2 text-xs ${mlConnected ? "text-success" : "text-base-content/40"}`}>
                    <span className={`w-2 h-2 rounded-full ${mlConnected ? "bg-success animate-pulse" : "bg-base-content/20"}`}></span>
                    {mlConnected ? "ML Connected" : "Using Database"}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{departments.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Departments</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{totalPatients}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Patients</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-primary">{activeDepts}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Active Depts</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-error">{totalHighRisk}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High Risk</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => {
                    const hasPatients = dept.patients > 0;
                    const barColor = dept.highRisk > 0 ? "bg-error" : hasPatients ? "bg-primary" : "bg-base-300";

                    return (
                        <div key={dept.name} className="bg-base-100 rounded-lg border border-base-300 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                                    <p className="text-xs text-base-content/40 mt-0.5">
                                        {hasPatients ? `Avg priority: ${dept.avgPriority.toFixed(1)}` : "No patients"}
                                    </p>
                                </div>
                                {hasPatients ? (
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                                        dept.highRisk > 0 ? "bg-error/10 text-error" : "bg-success/10 text-success"
                                    }`}>
                                        {dept.highRisk > 0 ? `${dept.highRisk} High Risk` : "Stable"}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-base-200 text-base-content/30">
                                        Empty
                                    </span>
                                )}
                            </div>

                            <div className="flex items-end justify-between mb-2">
                                <p className="text-xs text-base-content/40">
                                    <span className="text-lg font-bold text-base-content">{dept.patients}</span> patients
                                </p>
                            </div>

                            <div className="w-full bg-base-200 rounded-full h-1.5 mb-3">
                                <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(100, dept.patients * 10)}%` }}></div>
                            </div>

                            {/* Mini queue preview */}
                            {dept.queuePatients.length > 0 && (
                                <div className="space-y-1 mt-3 pt-3 border-t border-base-200">
                                    {dept.queuePatients.slice(0, 3).map((p, i) => {
                                        const riskCls = p.risk_level === "High" ? "text-error" : p.risk_level === "Medium" ? "text-warning" : "text-success";
                                        return (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <span className="text-base-content/50 font-mono">{p.patient_id}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${riskCls}`}>{p.risk_level}</span>
                                                    <span className="text-base-content/30">{p.priority_score.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {dept.queuePatients.length > 3 && (
                                        <p className="text-[10px] text-base-content/30 text-center">+{dept.queuePatients.length - 3} more</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
