"use client";

import { useEffect, useState, useCallback } from "react";

interface QueuePatient {
    patient_id: string;
    priority_score: number;
    risk_level: string;
    position: number;
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

    const fetchQueues = useCallback(async () => {
        try {
            const res = await fetch("/api/queue");
            if (res.ok) {
                const summary = await res.json();
                setMlConnected(true);

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
            } else {
                setMlConnected(false);
                setDepartments(ALL_DEPARTMENTS.map((name) => ({
                    name, patients: 0, highRisk: 0, avgPriority: 0, queuePatients: [],
                })));
            }
        } catch {
            setMlConnected(false);
            setDepartments(ALL_DEPARTMENTS.map((name) => ({
                name, patients: 0, highRisk: 0, avgPriority: 0, queuePatients: [],
            })));
        }
        setLoading(false);
    }, []);

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
                    <p className="text-sm text-base-content/40 mt-1">Live department queues from ML triage engine</p>
                </div>
                <div className={`flex items-center gap-2 text-xs ${mlConnected ? "text-success" : "text-error"}`}>
                    <span className={`w-2 h-2 rounded-full ${mlConnected ? "bg-success animate-pulse" : "bg-error"}`}></span>
                    {mlConnected ? "ML Connected" : "ML Offline"}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{ALL_DEPARTMENTS.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Departments</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{totalPatients}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total in Queues</p>
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
