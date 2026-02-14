"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        // Simulate login
        router.push("/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-base-200">
            <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
                <form className="card-body" onSubmit={handleLogin}>
                    <h2 className="text-center text-2xl font-bold">Login</h2>
                    <fieldset className="fieldset">
                        <label className="fieldset-label">Email</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            className="input w-full"
                            required
                        />
                        <label className="fieldset-label">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="input w-full"
                            required
                        />
                        <div className="flex justify-end">
                            <a className="link link-hover text-sm">Forgot password?</a>
                        </div>
                        <button className="btn btn-primary mt-4">Login</button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
