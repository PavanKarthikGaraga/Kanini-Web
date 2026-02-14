"use client";

import { useEffect, useState } from "react";

interface Patient {
    id: number;
    patient_id_display: string;
    age: number;
    gender: string;
    symptoms: string;
    risk_level: string;
    recommended_department: string;
    status: string;
    created_at: string;
}

export default function LiveQueuePage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        if (!orgId) {
            setLoading(false);
            return;
        }

        fetch("/api/patients", {
            headers: { "x-org-id": orgId },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setPatients(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const pending = patients.filter((p) => p.status === "Pending");
    const inProgress = patients.filter((p) => p.status === "In Progress");

    const riskBadge = (risk: string) => {
        const cls = risk === "High" ? "bg-error/10 text-error" : risk === "Medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
        return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cls}`}>{risk}</span>;
    };

    const statusBadge = (status: string) => {
        const cls = status === "Pending" ? "bg-warning/10 text-warning" : status === "In Progress" ? "bg-info/10 text-info" : "bg-base-300/50 text-base-content/40";
        return <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${cls}`}>{status}</span>;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Live Queue</h1>
                    <p className="text-sm text-base-content/40 mt-1">Real-time patient queue and triage status</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-base-content/30">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Live
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{patients.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total in Queue</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-warning">{pending.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Pending</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-info">{inProgress.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">In Progress</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-error">{patients.filter((p) => p.risk_level === "High").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High Risk</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12">
                    <div className="flex flex-col items-center justify-center text-base-content/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs">No patients in queue</p>
                    </div>
                </div>
            ) : (
                <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                    <table className="table text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                                <th>Patient ID</th>
                                <th>Age / Gender</th>
                                <th>Symptoms</th>
                                <th>Risk</th>
                                <th>Department</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr key={p.id} className="hover border-base-300/50">
                                    <td className="font-medium font-mono text-xs">{p.patient_id_display}</td>
                                    <td className="text-base-content/50">{p.age} / {p.gender}</td>
                                    <td className="text-base-content/50 max-w-[200px] truncate">{p.symptoms}</td>
                                    <td>{riskBadge(p.risk_level)}</td>
                                    <td className="text-base-content/50 text-xs">{p.recommended_department}</td>
                                    <td>{statusBadge(p.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
