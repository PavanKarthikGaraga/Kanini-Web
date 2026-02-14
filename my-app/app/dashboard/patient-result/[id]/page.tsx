"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Patient {
    id: string;
    patient_id_display: string;
    age: number;
    gender: string;
    symptoms: string;
    blood_pressure: string;
    heart_rate: number;
    temperature: number;
    pre_existing_conditions: string;
    risk_level: string;
    confidence_score: number;
    recommended_department: string;
    triage_notes: string;
    urgency_score: number;
    status: string;
    created_at: string;
}

export default function PatientResultPage() {
    const params = useParams();
    const patientId = params.id as string;
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        if (!orgId || !patientId) {
            setError("Missing session or patient ID.");
            setLoading(false);
            return;
        }

        fetch(`/api/triage?patientId=${patientId}&orgId=${orgId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.patient) setPatient(data.patient);
                else setError(data.error || "Patient not found.");
            })
            .catch(() => setError("Failed to load patient data."))
            .finally(() => setLoading(false));
    }, [patientId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-base-content/30">
                <p className="text-sm">{error || "Patient not found"}</p>
                <Link href="/dashboard/patients" className="btn btn-ghost btn-sm mt-4">Back to Patients</Link>
            </div>
        );
    }

    const riskColor = patient.risk_level === "High" ? "error" : patient.risk_level === "Medium" ? "warning" : "success";

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight">Triage Result</h1>
                        <span className={`badge badge-${riskColor} badge-sm uppercase font-bold`}>{patient.risk_level} Risk</span>
                    </div>
                    <p className="text-sm text-base-content/40">
                        Patient {patient.patient_id_display} &middot; Registered {new Date(patient.created_at).toLocaleString()}
                    </p>
                </div>
                <Link href="/dashboard/patients" className="btn btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    All Patients
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Risk Level */}
                <div className={`bg-${riskColor}/5 rounded-lg border border-${riskColor}/20 p-5`}>
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">Risk Level</p>
                    <p className={`text-3xl font-bold tracking-tight text-${riskColor}`}>{patient.risk_level}</p>
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-base-content/40">Urgency</span>
                            <span className="font-semibold">{patient.urgency_score}/100</span>
                        </div>
                        <progress className={`progress progress-${riskColor} w-full h-2`} value={patient.urgency_score} max="100"></progress>
                    </div>
                </div>

                {/* Confidence */}
                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">Confidence Score</p>
                    <p className="text-3xl font-bold tracking-tight">{(patient.confidence_score * 100).toFixed(0)}%</p>
                    <p className="text-xs text-base-content/30 mt-1">AI triage confidence</p>
                </div>

                {/* Department */}
                <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">Recommended Department</p>
                    <p className="text-lg font-bold tracking-tight text-primary">{patient.recommended_department}</p>
                    <p className="text-xs text-base-content/30 mt-1">Status: {patient.status}</p>
                </div>
            </div>

            {/* Triage Notes */}
            <div className="bg-base-100 rounded-lg border border-base-300 p-5 mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-3">Triage Notes</h2>
                <div className="flex flex-col gap-2">
                    {(patient.triage_notes || "").split(". ").filter(Boolean).map((note, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-${riskColor}`}></span>
                            <p className="text-sm text-base-content/70">{note.replace(/\.$/, "")}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Patient Info</h2>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <p className="text-base-content/40">Age</p>
                        <p className="font-medium">{patient.age} years</p>
                        <p className="text-base-content/40">Gender</p>
                        <p className="font-medium">{patient.gender}</p>
                        <p className="text-base-content/40">Symptoms</p>
                        <p className="font-medium">{patient.symptoms}</p>
                        <p className="text-base-content/40">Pre-existing</p>
                        <p className="font-medium">{patient.pre_existing_conditions || "None"}</p>
                    </div>
                </div>

                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Vitals</h2>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <p className="text-base-content/40">Blood Pressure</p>
                        <p className="font-medium font-mono">{patient.blood_pressure} mmHg</p>
                        <p className="text-base-content/40">Heart Rate</p>
                        <p className="font-medium font-mono">{patient.heart_rate} bpm</p>
                        <p className="text-base-content/40">Temperature</p>
                        <p className="font-medium font-mono">{patient.temperature}°F</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
