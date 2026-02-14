"use client";

import { useEffect, useState } from "react";

interface Org {
    id: string;
    name: string;
    type: string;
    phone: string;
    city: string;
    state: string;
    created_at: string;
    user_count: number;
}

interface OrgUser {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

const initialOrgForm = {
    orgName: "", orgType: "hospital", orgPhone: "",
    street: "", city: "", state: "", pincode: "", country: "India",
    fullName: "", email: "", password: "",
};

const initialUserForm = { fullName: "", email: "", password: "", role: "admin" };

export default function TenantsPage() {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);

    // Add Org modal
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [orgForm, setOrgForm] = useState(initialOrgForm);

    // Add User modal
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState(initialUserForm);
    const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);

    // View Users modal
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchOrgs = async () => {
        try {
            const res = await fetch("/api/admin/tenants");
            const data = await res.json();
            if (data.tenants) setOrgs(data.tenants);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchOrgs(); }, []);

    // --- Add Org ---
    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess(""); setSubmitting(true);
        try {
            const res = await fetch("/api/admin/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orgForm),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to create organization."); return; }
            setSuccess("Organization created successfully!");
            setOrgForm(initialOrgForm);
            setShowOrgModal(false);
            fetchOrgs();
        } catch { setError("Network error."); } finally { setSubmitting(false); }
    };

    // --- Add User to Org ---
    const openAddUser = (org: Org) => {
        setSelectedOrg(org);
        setUserForm(initialUserForm);
        setError(""); setSuccess("");
        setShowUserModal(true);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) return;
        setError(""); setSuccess(""); setSubmitting(true);
        try {
            const res = await fetch("/api/admin/tenants/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId: selectedOrg.id, ...userForm }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to add user."); return; }
            setSuccess(`User added to ${selectedOrg.name}!`);
            setUserForm(initialUserForm);
            setShowUserModal(false);
            fetchOrgs();
        } catch { setError("Network error."); } finally { setSubmitting(false); }
    };

    // --- View Users ---
    const openViewUsers = async (org: Org) => {
        setSelectedOrg(org);
        setShowUsersModal(true);
        setUsersLoading(true);
        setOrgUsers([]);
        try {
            const res = await fetch(`/api/admin/tenants/users?orgId=${org.id}`);
            const data = await res.json();
            if (data.users) setOrgUsers(data.users);
        } catch { /* ignore */ }
        setUsersLoading(false);
    };

    // --- Remove User ---
    const handleRemoveUser = async (user: OrgUser) => {
        if (!selectedOrg) return;
        if (!confirm(`Remove ${user.full_name} (${user.email}) from ${selectedOrg.name}?`)) return;
        try {
            const res = await fetch("/api/admin/tenants/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId: selectedOrg.id, userId: user.id, email: user.email }),
            });
            if (res.ok) {
                setOrgUsers((prev) => prev.filter((u) => u.id !== user.id));
                fetchOrgs();
            }
        } catch { /* ignore */ }
    };

    const updateOrgField = (field: string, value: string) => setOrgForm((prev) => ({ ...prev, [field]: value }));
    const updateUserField = (field: string, value: string) => setUserForm((prev) => ({ ...prev, [field]: value }));

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-sm text-base-content/40 mt-1">Manage organizations on the platform</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowOrgModal(true); setError(""); setSuccess(""); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Org
                </button>
            </div>

            {success && (
                <div className="alert alert-success text-sm mb-4">
                    <span>{success}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : orgs.length === 0 ? (
                <div className="bg-base-100 rounded-lg border border-base-300 p-12 text-center">
                    <div className="flex flex-col items-center text-base-content/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <p className="text-sm">No organizations yet</p>
                        <p className="text-xs mt-1">Add your first organization to get started</p>
                    </div>
                </div>
            ) : (
                <div className="bg-base-100 rounded-lg border border-base-300">
                    <div className="overflow-x-visible">
                        <table className="table table-sm">
                            <thead>
                                <tr className="border-b border-base-300">
                                    <th className="text-xs uppercase tracking-wider text-base-content/40">Organization</th>
                                    <th className="text-xs uppercase tracking-wider text-base-content/40">Type</th>
                                    <th className="text-xs uppercase tracking-wider text-base-content/40">Location</th>
                                    <th className="text-xs uppercase tracking-wider text-base-content/40">Users</th>
                                    <th className="text-xs uppercase tracking-wider text-base-content/40">Created</th>
                                    <th className="text-xs uppercase tracking-wider text-base-content/40">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgs.map((org) => (
                                    <tr key={org.id} className="border-b border-base-200 hover:bg-base-50">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {org.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{org.name}</p>
                                                    <p className="text-xs text-base-content/40">{org.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-ghost badge-sm capitalize">{org.type}</span>
                                        </td>
                                        <td className="text-sm text-base-content/60">{org.city}, {org.state}</td>
                                        <td className="text-sm font-medium">{org.user_count || 0}</td>
                                        <td className="text-xs text-base-content/40">
                                            {new Date(org.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="dropdown dropdown-end">
                                                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-square">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                                                </div>
                                                <ul tabIndex={0} className="dropdown-content z-[1] menu menu-sm shadow-xl bg-base-100 rounded-xl w-48 border border-base-300 p-1">
                                                    <li>
                                                        <button onClick={() => openAddUser(org)} className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                                            Add User
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() => openViewUsers(org)} className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            View Users
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== Add Organization Modal ===== */}
            {showOrgModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-1">Add New Organization</h3>
                        <p className="text-sm text-base-content/40 mb-6">Create a new organization with its first admin user</p>

                        {error && <div className="alert alert-error text-sm mb-4"><span>{error}</span></div>}

                        <form onSubmit={handleCreateOrg}>
                            <div className="mb-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">Organization Details</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Organization Name</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.orgName} onChange={(e) => updateOrgField("orgName", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Type</span></label>
                                        <select className="select select-bordered select-sm w-full" value={orgForm.orgType} onChange={(e) => updateOrgField("orgType", e.target.value)}>
                                            <option value="hospital">Hospital</option>
                                            <option value="clinic">Clinic</option>
                                            <option value="diagnostics">Diagnostics</option>
                                            <option value="pharmacy">Pharmacy</option>
                                        </select>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Phone</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.orgPhone} onChange={(e) => updateOrgField("orgPhone", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Street</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.street} onChange={(e) => updateOrgField("street", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">City</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.city} onChange={(e) => updateOrgField("city", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">State</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.state} onChange={(e) => updateOrgField("state", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Pincode</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.pincode} onChange={(e) => updateOrgField("pincode", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Country</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.country} onChange={(e) => updateOrgField("country", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">First Admin User</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Full Name</span></label>
                                        <input type="text" className="input input-bordered input-sm w-full" value={orgForm.fullName} onChange={(e) => updateOrgField("fullName", e.target.value)} required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text text-xs">Email</span></label>
                                        <input type="email" className="input input-bordered input-sm w-full" value={orgForm.email} onChange={(e) => updateOrgField("email", e.target.value)} required />
                                    </div>
                                    <div className="form-control md:col-span-2">
                                        <label className="label"><span className="label-text text-xs">Password</span></label>
                                        <input type="password" className="input input-bordered input-sm w-full" value={orgForm.password} onChange={(e) => updateOrgField("password", e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowOrgModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                    {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Create Organization"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop"><button onClick={() => setShowOrgModal(false)}>close</button></form>
                </dialog>
            )}

            {/* ===== Add User Modal ===== */}
            {showUserModal && selectedOrg && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-1">Add User</h3>
                        <p className="text-sm text-base-content/40 mb-6">
                            Add a new user to <span className="font-semibold text-base-content">{selectedOrg.name}</span>
                        </p>

                        {error && <div className="alert alert-error text-sm mb-4"><span>{error}</span></div>}

                        <form onSubmit={handleAddUser}>
                            <div className="flex flex-col gap-3">
                                <div className="form-control">
                                    <label className="label"><span className="label-text text-xs">Full Name</span></label>
                                    <input type="text" className="input input-bordered input-sm w-full" value={userForm.fullName} onChange={(e) => updateUserField("fullName", e.target.value)} required />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text text-xs">Email</span></label>
                                    <input type="email" className="input input-bordered input-sm w-full" value={userForm.email} onChange={(e) => updateUserField("email", e.target.value)} required />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text text-xs">Password</span></label>
                                    <input type="password" className="input input-bordered input-sm w-full" value={userForm.password} onChange={(e) => updateUserField("password", e.target.value)} required />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text text-xs">Role</span></label>
                                    <select className="select select-bordered select-sm w-full" value={userForm.role} onChange={(e) => updateUserField("role", e.target.value)}>
                                        <option value="admin">Admin</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="nurse">Nurse</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUserModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                    {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop"><button onClick={() => setShowUserModal(false)}>close</button></form>
                </dialog>
            )}

            {/* ===== View Users Modal ===== */}
            {showUsersModal && selectedOrg && (
                <dialog className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-lg">{selectedOrg.name}</h3>
                                <p className="text-sm text-base-content/40">Users in this organization</p>
                            </div>
                            <button className="btn btn-primary btn-xs" onClick={() => { setShowUsersModal(false); openAddUser(selectedOrg); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Add User
                            </button>
                        </div>

                        {usersLoading ? (
                            <div className="flex justify-center p-8">
                                <span className="loading loading-spinner loading-md text-primary"></span>
                            </div>
                        ) : orgUsers.length === 0 ? (
                            <div className="text-center p-8 text-base-content/30">
                                <p className="text-sm">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-sm">
                                    <thead>
                                        <tr className="border-b border-base-300">
                                            <th className="text-xs uppercase tracking-wider text-base-content/40">Name</th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40">Email</th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40">Role</th>
                                            <th className="text-xs uppercase tracking-wider text-base-content/40">Joined</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orgUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-base-200">
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {user.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium">{user.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-sm text-base-content/60">{user.email}</td>
                                                <td>
                                                    <span className={`badge badge-sm capitalize ${user.role === "admin" ? "badge-primary" : "badge-ghost"}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="text-xs text-base-content/40">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleRemoveUser(user)}
                                                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                                                        title="Remove user"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowUsersModal(false)}>Close</button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop"><button onClick={() => setShowUsersModal(false)}>close</button></form>
                </dialog>
            )}
        </div>
    );
}
