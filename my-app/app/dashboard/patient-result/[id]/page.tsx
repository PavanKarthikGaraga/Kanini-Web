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
    spo2: number;
    respiratory_rate: number;
    consciousness_level: string;
    pain_level: number;
    pre_existing_conditions: string;
    risk_level: string;
    confidence_score: number;
    recommended_department: string;
    triage_notes: string;
    urgency_score: number;
    dept_confidence: number;
    needs_escalation: boolean;
    escalation_reason: string | null;
    news2_score: number;
    risk_probabilities: Record<string, number>;
    dept_probabilities: Record<string, number>;
    status: string;
    created_at: string;
}

interface ShapExplanation {
    predicted_class: string;
    top_risk_factors: [string, number][];
    top_protective_factors: [string, number][];
    interpretation: string;
}

export default function PatientResultPage() {
    const params = useParams();
    const patientId = params.id as string;
    const [patient, setPatient] = useState<Patient | null>(null);
    const [shap, setShap] = useState<ShapExplanation | null>(null);
    const [loading, setLoading] = useState(true);
    const [shapLoading, setShapLoading] = useState(false);
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
                if (data.patient) {
                    setPatient(data.patient);
                    // Fetch SHAP explanation
                    fetchShapExplanation(data.patient);
                } else {
                    setError(data.error || "Patient not found.");
                }
            })
            .catch(() => setError("Failed to load patient data."))
            .finally(() => setLoading(false));
    }, [patientId]);

    const fetchShapExplanation = async (p: Patient) => {
        setShapLoading(true);
        try {
            const res = await fetch("/api/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    age: p.age,
                    gender: p.gender,
                    symptoms: p.symptoms,
                    blood_pressure: p.blood_pressure,
                    heart_rate: p.heart_rate,
                    temperature: p.temperature,
                    spo2: p.spo2 ?? 98,
                    respiratory_rate: p.respiratory_rate ?? 16,
                    consciousness_level: p.consciousness_level || "Alert",
                    pain_level: p.pain_level ?? 5,
                    pre_existing_conditions: p.pre_existing_conditions,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setShap(data);
            }
        } catch {
            // SHAP is optional, don't block the page
        } finally {
            setShapLoading(false);
        }
    };

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
    const riskProbs = typeof patient.risk_probabilities === "string"
        ? JSON.parse(patient.risk_probabilities)
        : patient.risk_probabilities;
    const deptProbs = typeof patient.dept_probabilities === "string"
        ? JSON.parse(patient.dept_probabilities)
        : patient.dept_probabilities;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight">Triage Result</h1>
                        <span className={`badge badge-${riskColor} badge-sm uppercase font-bold`}>{patient.risk_level} Risk</span>
                        {patient.needs_escalation && (
                            <span className="badge badge-error badge-sm uppercase font-bold animate-pulse">Escalation Needed</span>
                        )}
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

            {/* Escalation Warning */}
            {patient.needs_escalation && patient.escalation_reason && (
                <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-error">Escalation Required</p>
                    <p className="text-sm text-error/80 mt-1">{patient.escalation_reason}</p>
                </div>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`bg-${riskColor}/5 rounded-lg border border-${riskColor}/20 p-5`}>
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">Risk Level</p>
                    <p className={`text-3xl font-bold tracking-tight text-${riskColor}`}>{patient.risk_level}</p>
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-base-content/40">Priority</span>
                            <span className="font-semibold">{patient.urgency_score}/100</span>
                        </div>
                        <progress className={`progress progress-${riskColor} w-full h-2`} value={patient.urgency_score} max="100"></progress>
                    </div>
                </div>

                <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">ML Confidence</p>
                    <p className="text-3xl font-bold tracking-tight">{(patient.confidence_score * 100).toFixed(0)}%</p>
                    <p className="text-xs text-base-content/30 mt-1">AI model confidence</p>
                </div>

                <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">Department</p>
                    <p className="text-lg font-bold tracking-tight text-primary">{patient.recommended_department}</p>
                    <p className="text-xs text-base-content/30 mt-1">
                        {patient.dept_confidence ? `${(patient.dept_confidence * 100).toFixed(0)}% confidence` : `Status: ${patient.status}`}
                    </p>
                </div>

                <div className="bg-info/5 rounded-lg border border-info/20 p-5">
                    <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">NEWS2 Score</p>
                    <p className="text-3xl font-bold tracking-tight text-info">{patient.news2_score ?? "N/A"}</p>
                    <p className="text-xs text-base-content/30 mt-1">Clinical severity index</p>
                </div>
            </div>

            {/* Risk Probabilities */}
            {riskProbs && (
                <div className="bg-base-100 rounded-lg border border-base-300 p-5 mb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Risk Probability Distribution</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(riskProbs as Record<string, number>).map(([level, prob]) => {
                            const color = level === "High" ? "error" : level === "Medium" ? "warning" : "success";
                            return (
                                <div key={level} className="text-center">
                                    <p className={`text-2xl font-bold text-${color}`}>{(prob * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-base-content/40 mt-1">{level} Risk</p>
                                    <progress className={`progress progress-${color} w-full h-1.5 mt-2`} value={prob * 100} max="100"></progress>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SHAP Explanation */}
            <div className="bg-base-100 rounded-lg border border-base-300 p-5 mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">
                    AI Explanation (SHAP Analysis)
                </h2>
                {shapLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md text-primary"></span>
                        <span className="text-sm text-base-content/40 ml-3">Generating explanation...</span>
                    </div>
                ) : shap ? (
                    <div>
                        <p className="text-sm text-base-content/60 mb-4">{shap.interpretation}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-semibold text-error/70 uppercase tracking-wider mb-3">Risk Factors (Increasing Risk)</h3>
                                <div className="space-y-2">
                                    {shap.top_risk_factors.map(([feature, value], i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-base-content/60">{String(feature).replace(/_/g, " ")}</span>
                                                    <span className="font-mono font-semibold text-error">+{Number(value).toFixed(3)}</span>
                                                </div>
                                                <div className="w-full bg-base-200 rounded-full h-1.5">
                                                    <div className="bg-error h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.abs(Number(value)) * 150)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-success/70 uppercase tracking-wider mb-3">Protective Factors (Decreasing Risk)</h3>
                                <div className="space-y-2">
                                    {shap.top_protective_factors.map(([feature, value], i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-base-content/60">{String(feature).replace(/_/g, " ")}</span>
                                                    <span className="font-mono font-semibold text-success">{Number(value).toFixed(3)}</span>
                                                </div>
                                                <div className="w-full bg-base-200 rounded-full h-1.5">
                                                    <div className="bg-success h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.abs(Number(value)) * 150)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30 py-4 text-center">SHAP explanation unavailable. Ensure the ML backend is running.</p>
                )}
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

            {/* Top Department Probabilities */}
            {deptProbs && (
                <div className="bg-base-100 rounded-lg border border-base-300 p-5 mb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Department Routing Probabilities</h2>
                    <div className="space-y-2">
                        {Object.entries(deptProbs as Record<string, number>)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([dept, prob]) => (
                                <div key={dept} className="flex items-center gap-3">
                                    <span className="text-xs text-base-content/60 w-36 truncate">{dept}</span>
                                    <div className="flex-1 bg-base-200 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${prob * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs font-mono font-semibold w-14 text-right">{(prob * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Patient Details + Vitals */}
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
                        <p className="text-base-content/40">SpO2</p>
                        <p className="font-medium font-mono">{patient.spo2 ?? "N/A"}%</p>
                        <p className="text-base-content/40">Respiratory Rate</p>
                        <p className="font-medium font-mono">{patient.respiratory_rate ?? "N/A"} breaths/min</p>
                        <p className="text-base-content/40">Consciousness</p>
                        <p className="font-medium">{patient.consciousness_level || "N/A"}</p>
                        <p className="text-base-content/40">Pain Level</p>
                        <p className="font-medium">{patient.pain_level ?? "N/A"}/10</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
