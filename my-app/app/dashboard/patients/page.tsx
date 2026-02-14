"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Patient {
    id: string;
    patient_id_display: string;
    age: number;
    gender: string;
    symptoms: string;
    risk_level: string;
    recommended_department: string;
    status: string;
    urgency_score: number;
    created_at: string;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        if (!orgId) { setLoading(false); return; }

        fetch("/api/patients", { headers: { "x-org-id": orgId } })
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data)) setPatients(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

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
                    <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
                    <p className="text-sm text-base-content/40 mt-1">Manage and monitor all registered patients</p>
                </div>
                <Link href="/dashboard/add-patient" className="btn btn-primary btn-sm gap-2 rounded-full px-5 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Patient
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{patients.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-error">{patients.filter(p => p.risk_level === "High").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High Risk</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-warning">{patients.filter(p => p.status === "Pending").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Pending</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-info">{patients.filter(p => p.status === "In Progress").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">In Progress</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12">
                    <div className="flex flex-col items-center justify-center text-base-content/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="text-xs">No patients registered yet</p>
                        <Link href="/dashboard/add-patient" className="btn btn-primary btn-xs mt-3">Add Patient</Link>
                    </div>
                </div>
            ) : (
                <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                    <table className="table text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                                <th>Patient ID</th>
                                <th>Age / Gender</th>
                                <th>Risk</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr key={p.id} className="hover border-base-300/50">
                                    <td className="font-medium font-mono text-xs">{p.patient_id_display}</td>
                                    <td className="text-base-content/50">{p.age} / {p.gender}</td>
                                    <td>{riskBadge(p.risk_level)}</td>
                                    <td className="text-base-content/50 text-xs">{p.recommended_department}</td>
                                    <td>{statusBadge(p.status)}</td>
                                    <td className="text-base-content/30 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/dashboard/patient-result/${p.id}`} className="btn btn-ghost btn-xs">
                                            View
                                        </Link>
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
