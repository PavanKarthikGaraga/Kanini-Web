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
    confidence_score: number;
    recommended_department: string;
    triage_notes: string;
    needs_escalation: boolean;
    created_at: string;
}

export default function PagesPage() {
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

    const riskColor = (risk: string) => {
        return risk === "High" ? "border-l-error" : risk === "Medium" ? "border-l-warning" : "border-l-success";
    };

    const highCount = patients.filter(r => r.risk_level === "High").length;
    const medCount = patients.filter(r => r.risk_level === "Medium").length;
    const lowCount = patients.filter(r => r.risk_level === "Low").length;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Triage Reports</h1>
                    <p className="text-sm text-base-content/40 mt-1">AI-generated triage assessments and recommendations</p>
                </div>
                <Link href="/dashboard/add-patient" className="btn btn-primary btn-sm gap-2 rounded-full px-5 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Assessment
                </Link>
            </div>

            {loading ? (
                <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-4 animate-pulse">
                                <div className="h-7 bg-base-300 rounded w-10 mb-2"></div>
                                <div className="h-3 bg-base-300 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-5 animate-pulse">
                                <div className="h-4 bg-base-300 rounded w-48 mb-3"></div>
                                <div className="h-3 bg-base-300 rounded w-full mb-2"></div>
                                <div className="h-3 bg-base-300 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-error/5 rounded-lg border border-error/10 p-4">
                            <p className="text-2xl font-bold tracking-tight text-error">{highCount}</p>
                            <p className="text-[10px] font-medium text-error/50 uppercase tracking-wider mt-1">High Priority</p>
                        </div>
                        <div className="bg-warning/5 rounded-lg border border-warning/10 p-4">
                            <p className="text-2xl font-bold tracking-tight text-warning">{medCount}</p>
                            <p className="text-[10px] font-medium text-warning/50 uppercase tracking-wider mt-1">Medium Priority</p>
                        </div>
                        <div className="bg-success/5 rounded-lg border border-success/10 p-4">
                            <p className="text-2xl font-bold tracking-tight text-success">{lowCount}</p>
                            <p className="text-[10px] font-medium text-success/50 uppercase tracking-wider mt-1">Low Priority</p>
                        </div>
                    </div>

                    {patients.length === 0 ? (
                        <div className="bg-base-100 rounded-lg border border-base-300 p-8">
                            <div className="flex flex-col items-center justify-center text-base-content/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                <p className="text-xs">No triage reports yet</p>
                                <Link href="/dashboard/add-patient" className="btn btn-primary btn-xs mt-3">Add Patient</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {patients.map((report) => (
                                <Link key={report.id} href={`/dashboard/patient-result/${report.id}`} className={`bg-base-100 rounded-lg border border-base-300 border-l-4 ${riskColor(report.risk_level)} p-5 hover:border-primary/30 transition-colors`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold">{report.patient_id_display}</h3>
                                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${report.risk_level === "High" ? "bg-error/10 text-error" : report.risk_level === "Medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                                                    {report.risk_level}
                                                </span>
                                                {report.needs_escalation && (
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-error/10 text-error">
                                                        Escalated
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-base-content/40 mb-3 leading-relaxed">{report.triage_notes || report.symptoms}</p>
                                            <div className="flex items-center gap-4 text-[10px] text-base-content/30 uppercase tracking-wider">
                                                <span>{report.recommended_department}</span>
                                                <span>{report.age} / {report.gender}</span>
                                                <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-6 shrink-0">
                                            <div className="radial-progress text-primary text-xs" style={{ "--value": report.confidence_score, "--size": "3rem", "--thickness": "3px" } as React.CSSProperties}>
                                                {report.confidence_score}%
                                            </div>
                                            <p className="text-[9px] text-base-content/20 mt-1 uppercase tracking-wider">Confidence</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
