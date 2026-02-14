export default function DepartmentsPage() {
    const departments = [
        { name: "Emergency (ER)", head: "Dr. Meena Iyer", patients: 14, capacity: 20, status: "Active" },
        { name: "Cardiology", head: "Dr. Rajesh Kumar", patients: 8, capacity: 15, status: "Active" },
        { name: "Neurology", head: "Dr. Sunita Rao", patients: 6, capacity: 12, status: "Active" },
        { name: "Pulmonology", head: "Dr. Arjun Nair", patients: 10, capacity: 12, status: "Near Capacity" },
        { name: "Orthopedics", head: "Dr. Kavitha Menon", patients: 5, capacity: 10, status: "Active" },
        { name: "Gastroenterology", head: "Dr. Vikram Joshi", patients: 4, capacity: 10, status: "Active" },
        { name: "Internal Medicine", head: "Dr. Priya Sharma", patients: 11, capacity: 18, status: "Active" },
        { name: "Dermatology", head: "Dr. Anil Gupta", patients: 3, capacity: 8, status: "Active" },
        { name: "General Outpatient", head: "Dr. Lakshmi Devi", patients: 22, capacity: 30, status: "Active" },
    ];

    const totalPatients = departments.reduce((sum, d) => sum + d.patients, 0);
    const totalCapacity = departments.reduce((sum, d) => sum + d.capacity, 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                    <p className="text-sm text-base-content/40 mt-1">Hospital department overview and capacity</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{departments.length}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Departments</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{totalPatients}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Patients</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">{totalCapacity}</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Total Capacity</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-success">{Math.round((totalPatients / totalCapacity) * 100)}%</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Utilization</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => {
                    const utilization = Math.round((dept.patients / dept.capacity) * 100);
                    const barColor = utilization >= 85 ? "bg-error" : utilization >= 60 ? "bg-warning" : "bg-success";

                    return (
                        <div key={dept.name} className="bg-base-100 rounded-lg border border-base-300 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                                    <p className="text-xs text-base-content/40 mt-0.5">{dept.head}</p>
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    dept.status === "Near Capacity" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                                }`}>
                                    {dept.status}
                                </span>
                            </div>

                            <div className="flex items-end justify-between mb-2">
                                <p className="text-xs text-base-content/40">
                                    <span className="text-lg font-bold text-base-content">{dept.patients}</span> / {dept.capacity}
                                </p>
                                <p className="text-xs text-base-content/30">{utilization}%</p>
                            </div>

                            <div className="w-full bg-base-200 rounded-full h-1.5">
                                <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${utilization}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
