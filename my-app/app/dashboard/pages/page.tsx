export default function PagesPage() {
    const triageReports = [
        { id: 1, patient: "Rahul Sharma", risk: "High", confidence: 94, department: "Cardiology", reason: "Chest pain, elevated BP, family history of cardiac events", date: "2026-02-14" },
        { id: 2, patient: "Amit Patel", risk: "High", confidence: 91, department: "Neurology", reason: "Severe headache, dizziness, slurred speech observed", date: "2026-02-14" },
        { id: 3, patient: "Sneha Reddy", risk: "Medium", confidence: 78, department: "Orthopedics", reason: "Persistent joint pain, swelling in knee, limited mobility", date: "2026-02-14" },
        { id: 4, patient: "Karthik Menon", risk: "Medium", confidence: 82, department: "Gastroenterology", reason: "Recurring abdominal pain, nausea, weight loss over 2 weeks", date: "2026-02-14" },
        { id: 5, patient: "Vikram Singh", risk: "High", confidence: 97, department: "Pulmonology", reason: "Severe shortness of breath, SpO2 at 89%, chronic smoker", date: "2026-02-12" },
    ];

    const riskColor = (risk: string) => {
        return risk === "High" ? "border-l-error" : risk === "Medium" ? "border-l-warning" : "border-l-success";
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Triage Reports</h1>
                    <p className="text-sm text-base-content/40 mt-1">AI-generated triage assessments and recommendations</p>
                </div>
                <button className="btn btn-primary btn-sm gap-2 rounded-full px-5 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Assessment
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-error/5 rounded-lg border border-error/10 p-4">
                    <p className="text-2xl font-bold tracking-tight text-error">{triageReports.filter(r => r.risk === "High").length}</p>
                    <p className="text-[10px] font-medium text-error/50 uppercase tracking-wider mt-1">High Priority</p>
                </div>
                <div className="bg-warning/5 rounded-lg border border-warning/10 p-4">
                    <p className="text-2xl font-bold tracking-tight text-warning">{triageReports.filter(r => r.risk === "Medium").length}</p>
                    <p className="text-[10px] font-medium text-warning/50 uppercase tracking-wider mt-1">Medium Priority</p>
                </div>
                <div className="bg-success/5 rounded-lg border border-success/10 p-4">
                    <p className="text-2xl font-bold tracking-tight text-success">0</p>
                    <p className="text-[10px] font-medium text-success/50 uppercase tracking-wider mt-1">Low Priority</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {triageReports.map((report) => (
                    <div key={report.id} className={`bg-base-100 rounded-lg border border-base-300 border-l-4 ${riskColor(report.risk)} p-5`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold">{report.patient}</h3>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${report.risk === "High" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}>
                                        {report.risk}
                                    </span>
                                </div>
                                <p className="text-sm text-base-content/40 mb-3 leading-relaxed">{report.reason}</p>
                                <div className="flex items-center gap-4 text-[10px] text-base-content/30 uppercase tracking-wider">
                                    <span>{report.department}</span>
                                    <span>{report.date}</span>
                                </div>
                            </div>
                            <div className="text-right ml-6 shrink-0">
                                <div className="radial-progress text-primary text-xs" style={{ "--value": report.confidence, "--size": "3rem", "--thickness": "3px" } as React.CSSProperties}>
                                    {report.confidence}%
                                </div>
                                <p className="text-[9px] text-base-content/20 mt-1 uppercase tracking-wider">Confidence</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
