export default function PatientsPage() {
    const patients = [
        { id: 1, name: "Rahul Sharma", age: 45, risk: "High", department: "Cardiology", status: "In Treatment", date: "2026-02-14" },
        { id: 2, name: "Priya Nair", age: 32, risk: "Low", department: "General", status: "Discharged", date: "2026-02-13" },
        { id: 3, name: "Amit Patel", age: 58, risk: "High", department: "Neurology", status: "In Treatment", date: "2026-02-14" },
        { id: 4, name: "Sneha Reddy", age: 27, risk: "Medium", department: "Orthopedics", status: "Waiting", date: "2026-02-14" },
        { id: 5, name: "Vikram Singh", age: 63, risk: "High", department: "Pulmonology", status: "In Treatment", date: "2026-02-12" },
        { id: 6, name: "Ananya Gupta", age: 19, risk: "Low", department: "General", status: "Discharged", date: "2026-02-11" },
        { id: 7, name: "Karthik Menon", age: 41, risk: "Medium", department: "Gastroenterology", status: "Waiting", date: "2026-02-14" },
        { id: 8, name: "Divya Iyer", age: 36, risk: "Low", department: "Dermatology", status: "Discharged", date: "2026-02-10" },
    ];

    const riskBadge = (risk: string) => {
        const cls = risk === "High" ? "bg-error/10 text-error" : risk === "Medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
        return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cls}`}>{risk}</span>;
    };

    const statusBadge = (status: string) => {
        const cls = status === "In Treatment" ? "bg-info/10 text-info" : status === "Waiting" ? "bg-warning/10 text-warning" : "bg-base-300/50 text-base-content/40";
        return <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${cls}`}>{status}</span>;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
                    <p className="text-sm text-base-content/40 mt-1">Manage and monitor all registered patients</p>
                </div>
                <button className="btn btn-primary btn-sm gap-2 rounded-full px-5 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Patient
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{patients.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-error">{patients.filter(p => p.risk === "High").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">High Risk</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-warning">{patients.filter(p => p.status === "Waiting").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Waiting</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-info">{patients.filter(p => p.status === "In Treatment").length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">In Treatment</p>
                </div>
            </div>

            <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                <table className="table text-sm">
                    <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                            <th>Name</th>
                            <th>Age</th>
                            <th>Risk</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p) => (
                            <tr key={p.id} className="hover border-base-300/50">
                                <td className="font-medium">{p.name}</td>
                                <td className="text-base-content/50">{p.age}</td>
                                <td>{riskBadge(p.risk)}</td>
                                <td className="text-base-content/50">{p.department}</td>
                                <td>{statusBadge(p.status)}</td>
                                <td className="text-base-content/30 text-xs">{p.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
