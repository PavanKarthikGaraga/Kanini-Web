"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = ["Organization", "Address", "Admin Account"];

export default function SignUpPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [orgName, setOrgName] = useState("");
    const [orgPhone, setOrgPhone] = useState("");
    const [orgType, setOrgType] = useState("");

    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [country, setCountry] = useState("India");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const validateStep = (): boolean => {
        setError("");
        if (currentStep === 0) {
            if (!orgName.trim() || !orgPhone.trim() || !orgType) {
                setError("Please fill in all fields.");
                return false;
            }
        } else if (currentStep === 1) {
            if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
                setError("Please fill in all address fields.");
                return false;
            }
        } else if (currentStep === 2) {
            if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
                setError("Please fill in all fields.");
                return false;
            }
            if (password.length < 8) {
                setError("Password must be at least 8 characters.");
                return false;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep((s) => s + 1);
        }
    };

    const handleBack = () => {
        setError("");
        setCurrentStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orgName, orgType, orgPhone,
                    street, city, state, pincode, country,
                    fullName, email, password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Signup failed.");
                return;
            }

            router.push("/auth/login");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    );

    const EyeOffIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
    );

    return (
        <>
            <div className="bg-base-100 rounded-lg border border-base-300">
                <div className="card-body">
                    <h2 className="text-2xl font-bold text-center tracking-tight">Create Account</h2>
                    <p className="text-center text-xs text-base-content/40 mb-4">Register your organization</p>

                    {/* Step Indicator */}
                    <ul className="steps steps-horizontal w-full mb-6">
                        {STEPS.map((label, i) => (
                            <li
                                key={label}
                                className={`step ${i <= currentStep ? "step-primary" : ""}`}
                            >
                                <span className="text-xs">{label}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Error */}
                    {error && (
                        <div className="alert alert-error text-sm mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: Organization */}
                    {currentStep === 0 && (
                        <div className="flex flex-col gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Hospital / Organization Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="City General Hospital"
                                    className="input input-bordered w-full"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Organization Type</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={orgType}
                                    onChange={(e) => setOrgType(e.target.value)}
                                >
                                    <option value="" disabled>Select type</option>
                                    <option value="hospital">Hospital</option>
                                    <option value="clinic">Clinic</option>
                                    <option value="diagnostic">Diagnostic Center</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Phone Number</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    className="input input-bordered w-full"
                                    value={orgPhone}
                                    onChange={(e) => setOrgPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Address */}
                    {currentStep === 1 && (
                        <div className="flex flex-col gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Street Address</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="123 Medical Avenue"
                                    className="input input-bordered w-full"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">City</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Hyderabad"
                                        className="input input-bordered w-full"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">State</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Telangana"
                                        className="input input-bordered w-full"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Pincode</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="500001"
                                        className="input input-bordered w-full"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Country</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="India"
                                        className="input input-bordered w-full"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Admin Account */}
                    {currentStep === 2 && (
                        <div className="flex flex-col gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Dr. John Doe"
                                    className="input input-bordered w-full"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="admin@hospital.com"
                                    className="input input-bordered w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Password</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 8 characters"
                                        className="input input-bordered w-full pr-12"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Confirm Password</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        className="input input-bordered w-full pr-12"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        {currentStep > 0 ? (
                            <button type="button" className="btn btn-ghost" onClick={handleBack}>
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {currentStep < STEPS.length - 1 ? (
                            <button type="button" className="btn btn-primary" onClick={handleNext}>
                                Next
                            </button>
                        ) : (
                            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Create Account"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-center text-sm mt-6">
                Already have an account?{" "}
                <Link href="/auth/login" className="link link-primary font-semibold">
                    Login
                </Link>
            </p>
        </>
    );
}
