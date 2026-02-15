"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPatientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        age: "",
        gender: "Male",
        symptoms: "",
        blood_pressure: "",
        heart_rate: "",
        temperature: "",
        spo2: "",
        respiratory_rate: "",
        consciousness_level: "Alert",
        pain_level: "5",
        pre_existing_conditions: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const raw = localStorage.getItem("kairo_user");
        const user = raw ? JSON.parse(raw) : null;
        const orgId = user?.orgId;

        if (!orgId) {
            alert("Session expired. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, org_id: orgId }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push(`/dashboard/patient-result/${data.id}`);
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch {
            alert("Failed to register patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Add Patient</h1>
                <p className="text-sm text-base-content/40 mt-1">Register a new patient for AI-powered triage assessment</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-base-100 rounded-lg border border-base-300 p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-5">Patient Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={form.age}
                                onChange={handleChange}
                                required
                                min={0}
                                max={120}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 45"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Gender</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="select select-bordered w-full select-sm"
                            >
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Symptoms</label>
                        <textarea
                            name="symptoms"
                            value={form.symptoms}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="textarea textarea-bordered w-full textarea-sm"
                            placeholder="e.g. Chest Pain, Shortness of Breath, Fever"
                        />
                    </div>

                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-5">Vitals</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Blood Pressure</label>
                            <input
                                type="text"
                                name="blood_pressure"
                                value={form.blood_pressure}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 120/80"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Heart Rate (bpm)</label>
                            <input
                                type="number"
                                name="heart_rate"
                                value={form.heart_rate}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 72"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Temperature (°F)</label>
                            <input
                                type="number"
                                step="0.1"
                                name="temperature"
                                value={form.temperature}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 98.6"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">SpO2 (%)</label>
                            <input
                                type="number"
                                name="spo2"
                                value={form.spo2}
                                onChange={handleChange}
                                required
                                min={0}
                                max={100}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 98"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Respiratory Rate (breaths/min)</label>
                            <input
                                type="number"
                                name="respiratory_rate"
                                value={form.respiratory_rate}
                                onChange={handleChange}
                                required
                                min={0}
                                max={100}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 16"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Pain Level (0-10)</label>
                            <input
                                type="number"
                                name="pain_level"
                                value={form.pain_level}
                                onChange={handleChange}
                                required
                                min={0}
                                max={10}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 5"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Consciousness Level</label>
                            <select
                                name="consciousness_level"
                                value={form.consciousness_level}
                                onChange={handleChange}
                                className="select select-bordered w-full select-sm"
                            >
                                <option value="Alert">Alert</option>
                                <option value="Verbal">Verbal</option>
                                <option value="Pain">Pain</option>
                                <option value="Unresponsive">Unresponsive</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Pre-existing Conditions</label>
                            <input
                                type="text"
                                name="pre_existing_conditions"
                                value={form.pre_existing_conditions}
                                onChange={handleChange}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. Diabetes, Hypertension (optional)"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-base-300">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-sm rounded-full px-6 text-xs"
                        >
                            {loading ? <span className="loading loading-spinner loading-xs"></span> : "Register Patient"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-ghost btn-sm rounded-full px-6 text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
