export default function ReportsPage() {
    const weeklyData = [
        { day: "Mon", admissions: 12, discharges: 8 },
        { day: "Tue", admissions: 15, discharges: 11 },
        { day: "Wed", admissions: 9, discharges: 13 },
        { day: "Thu", admissions: 18, discharges: 10 },
        { day: "Fri", admissions: 14, discharges: 16 },
        { day: "Sat", admissions: 7, discharges: 9 },
        { day: "Sun", admissions: 5, discharges: 6 },
    ];

    const departmentStats = [
        { name: "Emergency (ER)", patients: 42, avgWait: "12 min", satisfaction: 88 },
        { name: "Cardiology", patients: 28, avgWait: "25 min", satisfaction: 92 },
        { name: "Neurology", patients: 19, avgWait: "30 min", satisfaction: 90 },
        { name: "Pulmonology", patients: 31, avgWait: "18 min", satisfaction: 85 },
        { name: "General Outpatient", patients: 67, avgWait: "35 min", satisfaction: 78 },
    ];

    const maxAdmissions = Math.max(...weeklyData.map((d) => d.admissions));

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                    <p className="text-sm text-base-content/40 mt-1">Analytics and performance metrics</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm text-xs rounded-full">This Week</button>
                    <button className="btn btn-ghost btn-sm text-xs rounded-full text-base-content/30">This Month</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">187</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Visits</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">24 min</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Avg Wait Time</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-success">87%</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Satisfaction</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-info">94%</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Triage Accuracy</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Weekly Admissions</h2>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                        <div className="flex items-end gap-3 h-40">
                            {weeklyData.map((d) => (
                                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center gap-1" style={{ height: "120px" }}>
                                        <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                                            <div
                                                className="w-5 bg-primary/20 rounded-t"
                                                style={{ height: `${(d.admissions / maxAdmissions) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-base-content/30">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Risk Distribution</h2>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-5">
                        <div className="flex flex-col gap-4">
                            {[
                                { label: "High Risk", count: 23, total: 187, color: "bg-error" },
                                { label: "Medium Risk", count: 58, total: 187, color: "bg-warning" },
                                { label: "Low Risk", count: 106, total: 187, color: "bg-success" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-base-content/60">{item.label}</span>
                                        <span className="text-xs text-base-content/30">{item.count} ({Math.round((item.count / item.total) * 100)}%)</span>
                                    </div>
                                    <div className="w-full bg-base-200 rounded-full h-2">
                                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / item.total) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/40 mb-4">Department Performance</h2>
                <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                    <table className="table text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-base-content/30">
                                <th>Department</th>
                                <th>Patients (30d)</th>
                                <th>Avg Wait</th>
                                <th>Satisfaction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentStats.map((dept) => (
                                <tr key={dept.name} className="hover border-base-300/50">
                                    <td className="font-medium">{dept.name}</td>
                                    <td className="text-base-content/50">{dept.patients}</td>
                                    <td className="text-base-content/50">{dept.avgWait}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-base-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${dept.satisfaction >= 90 ? "bg-success" : dept.satisfaction >= 80 ? "bg-warning" : "bg-error"}`}
                                                    style={{ width: `${dept.satisfaction}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-base-content/40">{dept.satisfaction}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}