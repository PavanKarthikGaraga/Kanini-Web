"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEPARTMENTS = [
    "Cardiology", "Emergency", "General Medicine", "Neurology",
    "Pulmonology", "Gastroenterology", "Pediatrics",
    "Nephrology", "Oncology", "Orthopedics"
];

export default function AddDoctorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        specialization: "",
        department: DEPARTMENTS[0],
        phone: "",
        email: "",
        max_patients: "5",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            const res = await fetch("/api/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, org_id: orgId, max_patients: parseInt(form.max_patients) }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push("/dashboard/doctors");
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch {
            alert("Failed to register doctor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Add Doctor</h1>
                <p className="text-sm text-base-content/40 mt-1">Register a new doctor for patient assignment</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-base-100 rounded-lg border border-base-300 p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-5">Doctor Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. Dr. Rajesh Kumar"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                value={form.specialization}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. Interventional Cardiologist"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Department</label>
                            <select
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                className="select select-bordered w-full select-sm"
                            >
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Max Patients</label>
                            <input
                                type="number"
                                name="max_patients"
                                value={form.max_patients}
                                onChange={handleChange}
                                required
                                min={1}
                                max={20}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. 5"
                            />
                        </div>
                    </div>

                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-5">Contact Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. +91 98765 43210 (optional)"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-base-content/50 mb-1.5 block">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="input input-bordered w-full input-sm"
                                placeholder="e.g. doctor@hospital.com (optional)"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-base-300">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-sm rounded-full px-6 text-xs"
                        >
                            {loading ? <span className="loading loading-spinner loading-xs"></span> : "Register Doctor"}
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
