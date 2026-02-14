export default function AIInsightsPage() {
    const insights = [
        {
            title: "High-Risk Patient Surge",
            description: "3 high-risk patients admitted in the last 2 hours. ER capacity is approaching 70%. Consider activating overflow protocol.",
            type: "alert",
            time: "12 min ago",
        },
        {
            title: "Cardiology Department Trend",
            description: "Cardiology admissions increased 35% this week compared to the monthly average. Recommend scheduling additional on-call cardiologist.",
            type: "trend",
            time: "1 hour ago",
        },
        {
            title: "Triage Accuracy Report",
            description: "AI triage model achieved 94.2% accuracy over the past 30 days. 2 cases were escalated from Medium to High risk by attending physicians.",
            type: "report",
            time: "3 hours ago",
        },
        {
            title: "Wait Time Optimization",
            description: "Average wait time reduced by 18% after implementing priority queue adjustments last week. General OPD shows the most improvement.",
            type: "success",
            time: "6 hours ago",
        },
        {
            title: "Resource Allocation Suggestion",
            description: "Based on current admission trends, Pulmonology may need 2 additional beds by end of week. Current utilization at 83%.",
            type: "trend",
            time: "1 day ago",
        },
    ];

    const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
        alert: { bg: "bg-error/10", text: "text-error", label: "Alert" },
        trend: { bg: "bg-info/10", text: "text-info", label: "Trend" },
        report: { bg: "bg-primary/10", text: "text-primary", label: "Report" },
        success: { bg: "bg-success/10", text: "text-success", label: "Improvement" },
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
                    <p className="text-sm text-base-content/40 mt-1">Automated analysis and recommendations</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-base-content/30">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Model active
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">94.2%</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Triage Accuracy</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight">247</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Assessments (30d)</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-success">-18%</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Avg Wait Time</p>
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                    <p className="text-2xl font-bold tracking-tight text-warning">2</p>
                    <p className="text-[10px] text-base-content/30 uppercase tracking-wider mt-1">Escalations</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {insights.map((insight, i) => {
                    const style = typeStyles[insight.type];
                    return (
                        <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-5">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-sm">{insight.title}</h3>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                                        {style.label}
                                    </span>
                                </div>
                                <span className="text-[10px] text-base-content/30 shrink-0 ml-4">{insight.time}</span>
                            </div>
                            <p className="text-sm text-base-content/50 leading-relaxed">{insight.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
