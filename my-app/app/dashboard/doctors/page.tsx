"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Doctor {
    id: string;
    full_name: string;
    specialization: string;
    department: string;
    phone: string;
    email: string;
    status: string;
    max_patients: number;
    assigned_count: number;
    created_at: string;
}

interface Patient {
    id: string;
    patient_id_display: string;
    risk_level: string;
    recommended_department: string;
    urgency_score: number;
    assigned_doctor_id: string | null;
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [assignResult, setAssignResult] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);

    const fetchData = useCallback(async (org: string) => {
        try {
            const [docRes, patRes] = await Promise.all([
                fetch("/api/doctors", { headers: { "x-org-id": org } }),
                fetch("/api/patients", { headers: { "x-org-id": org } }),
            ]);
            if (docRes.ok) {
                const d = await docRes.json();
                if (Array.isArray(d)) setDoctors(d);
            }
            if (patRes.ok) {
                const p = await patRes.json();
                if (Array.isArray(p)) setPatients(p);
            }
        } catch {
            // ignore
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const org = user?.orgId;
        setOrgId(org);
        if (!org) { setLoading(false); return; }
        fetchData(org);
    }, [fetchData]);

    const handleAutoAssign = async () => {
        if (!orgId) return;
        setAssigning(true);
        setAssignResult(null);
        try {
            const res = await fetch("/api/doctors/assign", {
                method: "POST",
                headers: { "x-org-id": orgId },
            });
            const data = await res.json();
            if (res.ok) {
                setAssignResult(`Assigned ${data.assignedCount} patient(s). ${data.unassignedRemaining} still unassigned.`);
                fetchData(orgId);
            } else {
                setAssignResult(data.error || "Assignment failed");
            }
        } catch {
            setAssignResult("Assignment failed");
        }
        setAssigning(false);
    };

    const handleDelete = async (doctorId: string) => {
        if (!orgId || !confirm("Remove this doctor? Their patient assignments will be cleared.")) return;
        try {
            const res = await fetch("/api/doctors", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ org_id: orgId, doctor_id: doctorId }),
            });
            if (res.ok) fetchData(orgId);
        } catch {
            // ignore
        }
    };

    const highRisk = patients.filter((p) => p.risk_level === "High");
    const unassigned = patients.filter((p) => !p.assigned_doctor_id);
    const unassignedHigh = highRisk.filter((p) => !p.assigned_doctor_id);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
                    <p className="text-sm text-base-content/40 mt-1">Manage doctors and assign to high-risk patients</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAutoAssign}
                        disabled={assigning || doctors.length === 0}
                        className="btn btn-accent btn-sm gap-2 rounded-full px-5 text-xs"
                    >
                        {assigning ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        )}
                        Auto-Assign
                    </button>
                    <Link href="/dashboard/add-doctor" className="btn btn-primary btn-sm gap-2 rounded-full px-5 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Doctor
                    </Link>
                </div>
            </div>

            {assignResult && (
                <div className="alert alert-info mb-4 text-sm py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{assignResult}</span>
                    <button className="btn btn-ghost btn-xs" onClick={() => setAssignResult(null)}>Dismiss</button>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-4 animate-pulse">
                            <div className="h-7 bg-base-300 rounded w-10 mb-2"></div>
                            <div className="h-3 bg-base-300 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                            <p className="text-2xl font-bold tracking-tight">{doctors.length}</p>
                            <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Doctors</p>
                        </div>
                        <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                            <p className="text-2xl font-bold tracking-tight text-error">{unassignedHigh.length}</p>
                            <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High-Risk Unassigned</p>
                        </div>
                        <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                            <p className="text-2xl font-bold tracking-tight text-warning">{unassigned.length}</p>
                            <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Unassigned</p>
                        </div>
                        <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                            <p className="text-2xl font-bold tracking-tight text-success">{doctors.filter((d) => d.status === "Available").length}</p>
                            <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Available</p>
                        </div>
                    </div>

                    {/* Unassigned high-risk patients alert */}
                    {unassignedHigh.length > 0 && (
                        <div className="bg-error/5 border border-error/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                <h3 className="text-sm font-semibold text-error">
                                    {unassignedHigh.length} high-risk patient{unassignedHigh.length > 1 ? "s" : ""} without a doctor
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {unassignedHigh.slice(0, 8).map((p) => (
                                    <Link key={p.id} href={`/dashboard/patient-result/${p.id}`} className="text-xs bg-error/10 text-error px-2 py-1 rounded font-mono hover:bg-error/20 transition-colors">
                                        {p.patient_id_display} — {p.recommended_department}
                                    </Link>
                                ))}
                                {unassignedHigh.length > 8 && (
                                    <span className="text-xs text-error/50">+{unassignedHigh.length - 8} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Doctors list */}
                    {doctors.length === 0 ? (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-12">
                            <div className="flex flex-col items-center justify-center text-base-content/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs mb-3">No doctors registered yet</p>
                                <Link href="/dashboard/add-doctor" className="btn btn-primary btn-xs">Add Doctor</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {doctors.map((doc) => {
                                const atCapacity = doc.assigned_count >= doc.max_patients;
                                const assignedPatients = patients.filter((p) => p.assigned_doctor_id === doc.id);
                                return (
                                    <div key={doc.id} className="bg-base-100 rounded-lg border border-base-300 p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-sm">{doc.full_name}</h3>
                                                <p className="text-xs text-base-content/40 mt-0.5">{doc.specialization}</p>
                                            </div>
                                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                atCapacity ? "bg-error/10 text-error" : doc.status === "Available" ? "bg-success/10 text-success" : "bg-base-200 text-base-content/30"
                                            }`}>
                                                {atCapacity ? "At Capacity" : doc.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] text-base-content/30 uppercase tracking-wider mb-3">
                                            <span>{doc.department}</span>
                                            {doc.phone && <span>{doc.phone}</span>}
                                        </div>

                                        {/* Load bar */}
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-xs text-base-content/40">Patient load</span>
                                            <span className="text-xs font-medium">{doc.assigned_count}/{doc.max_patients}</span>
                                        </div>
                                        <div className="w-full bg-base-200 rounded-full h-1.5 mb-3">
                                            <div
                                                className={`h-1.5 rounded-full transition-all ${atCapacity ? "bg-error" : "bg-primary"}`}
                                                style={{ width: `${Math.min(100, (doc.assigned_count / doc.max_patients) * 100)}%` }}
                                            ></div>
                                        </div>

                                        {/* Assigned patients preview */}
                                        {assignedPatients.length > 0 && (
                                            <div className="space-y-1 pt-3 border-t border-base-200">
                                                {assignedPatients.slice(0, 3).map((p) => {
                                                    const riskCls = p.risk_level === "High" ? "text-error" : p.risk_level === "Medium" ? "text-warning" : "text-success";
                                                    return (
                                                        <Link key={p.id} href={`/dashboard/patient-result/${p.id}`} className="flex items-center justify-between text-xs hover:bg-base-200 rounded px-1 py-0.5 -mx-1 transition-colors">
                                                            <span className="text-base-content/50 font-mono">{p.patient_id_display}</span>
                                                            <span className={`font-semibold ${riskCls}`}>{p.risk_level}</span>
                                                        </Link>
                                                    );
                                                })}
                                                {assignedPatients.length > 3 && (
                                                    <p className="text-[10px] text-base-content/30 text-center">+{assignedPatients.length - 3} more</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-base-200">
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="btn btn-ghost btn-xs text-error/50 hover:text-error"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
