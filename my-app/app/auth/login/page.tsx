"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface OrgInfo {
    fullName: string;
    orgName: string;
    orgType: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
    const [lookingUp, setLookingUp] = useState(false);

    const lookupOrg = useCallback(async (emailValue: string) => {
        if (!emailValue || !emailValue.includes("@")) {
            setOrgInfo(null);
            return;
        }

        setLookingUp(true);
        try {
            const res = await fetch("/api/auth/lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailValue }),
            });
            const data = await res.json();
            if (data.found) {
                setOrgInfo({ fullName: data.fullName, orgName: data.orgName, orgType: data.orgType });
            } else {
                setOrgInfo(null);
            }
        } catch {
            setOrgInfo(null);
        } finally {
            setLookingUp(false);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed.");
                return;
            }

            localStorage.setItem("kairo_user", JSON.stringify(data.user));
            document.cookie = "kairo_session=true; path=/;";
            router.push("/dashboard");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-base-100 rounded-lg border border-base-300">
            <div className="card-body">
                <h2 className="text-2xl font-bold text-center tracking-tight">Welcome Back</h2>
                <p className="text-center text-xs text-base-content/40 mb-6">Sign in to your account</p>

                {error && (
                    <div className="alert alert-error text-sm mb-4">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="you@hospital.com"
                            className="input input-bordered w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={(e) => lookupOrg(e.target.value)}
                            required
                        />
                        {lookingUp && (
                            <div className="mt-2 flex items-center gap-2 text-sm opacity-60">
                                <span className="loading loading-spinner loading-xs"></span>
                                Looking up organization...
                            </div>
                        )}
                        {orgInfo && !lookingUp && (
                            <div className="mt-2 p-3 bg-base-200 rounded-lg border border-base-300">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-sm font-bold">
                                        {orgInfo.orgName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{orgInfo.orgName}</p>
                                        <p className="text-xs opacity-60 capitalize">{orgInfo.orgType} &middot; {orgInfo.fullName}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-control mb-2">
                        <label className="label">
                            <span className="label-text font-medium">Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="input input-bordered w-full pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end mb-6">
                        <a className="link link-hover text-sm link-primary">Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : "Login"}
                    </button>
                </form>

                <div className="divider">OR</div>

                <p className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="link link-primary font-semibold">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
