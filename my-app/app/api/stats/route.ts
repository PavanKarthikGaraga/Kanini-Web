import { rawQuery, getTenantSchema } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const orgId = req.headers.get("x-org-id");

    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    const schema = getTenantSchema(orgId);

    try {
        // Run all queries in parallel
        const [
            allPatients,
            newThisWeek,
            pendingCount,
            assessments30d,
            avgConfidence,
            escalationCount,
            riskDistribution,
            weeklyAdmissions,
            departmentStats,
            recentPatients,
            highRiskRecent,
        ] = await Promise.all([
            // Total patients
            rawQuery(`SELECT COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1`, [orgId]),
            // New this week
            rawQuery(`SELECT COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`, [orgId]),
            // Pending
            rawQuery(`SELECT COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1 AND status = 'Pending'`, [orgId]),
            // Assessments in last 30 days
            rawQuery(`SELECT COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`, [orgId]),
            // Average confidence score
            rawQuery(`SELECT COALESCE(ROUND(AVG(confidence_score)::numeric, 1), 0) AS avg FROM ${schema}.patients WHERE org_id = $1`, [orgId]),
            // Escalation count
            rawQuery(`SELECT COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1 AND needs_escalation = true`, [orgId]),
            // Risk distribution
            rawQuery(`SELECT risk_level, COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1 GROUP BY risk_level`, [orgId]),
            // Weekly admissions (current week, grouped by day)
            rawQuery(`
                SELECT TO_CHAR(created_at, 'Dy') AS day, COUNT(*)::int AS admissions
                FROM ${schema}.patients
                WHERE org_id = $1 AND created_at >= DATE_TRUNC('week', NOW())
                GROUP BY TO_CHAR(created_at, 'Dy'), EXTRACT(DOW FROM created_at)
                ORDER BY EXTRACT(DOW FROM created_at)
            `, [orgId]),
            // Department stats
            rawQuery(`
                SELECT recommended_department AS name, COUNT(*)::int AS patients
                FROM ${schema}.patients
                WHERE org_id = $1 AND recommended_department IS NOT NULL
                GROUP BY recommended_department
                ORDER BY patients DESC
            `, [orgId]),
            // Recent 5 patients
            rawQuery(`
                SELECT id, patient_id_display, age, gender, risk_level, recommended_department, created_at
                FROM ${schema}.patients
                WHERE org_id = $1
                ORDER BY created_at DESC
                LIMIT 5
            `, [orgId]),
            // High risk in last 2 hours
            rawQuery(`SELECT COUNT(*)::int AS count FROM ${schema}.patients WHERE org_id = $1 AND risk_level = 'High' AND created_at >= NOW() - INTERVAL '2 hours'`, [orgId]),
        ]);

        // Build risk distribution map
        const riskMap: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
        for (const row of riskDistribution) {
            if (row.risk_level) riskMap[row.risk_level] = row.count;
        }

        // Fill weekly admissions for all days
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyMap: Record<string, number> = {};
        for (const row of weeklyAdmissions) {
            weeklyMap[row.day] = row.admissions;
        }
        const weeklyFilled = dayOrder.map(day => ({ day, admissions: weeklyMap[day] || 0 }));

        // Find top department
        const topDept = departmentStats.length > 0 ? departmentStats[0] : null;

        // Generate insights from real data
        const insights = [];
        const highRecentCount = highRiskRecent[0]?.count || 0;
        if (highRecentCount > 0) {
            insights.push({
                title: "High-Risk Patient Alert",
                description: `${highRecentCount} high-risk patient${highRecentCount > 1 ? "s" : ""} admitted in the last 2 hours. Monitor capacity closely.`,
                type: "alert",
                time: "Recent",
            });
        }
        if (topDept) {
            insights.push({
                title: `${topDept.name} Department Load`,
                description: `${topDept.name} has the highest patient volume with ${topDept.patients} patients. Consider reviewing staffing allocation.`,
                type: "trend",
                time: "Current",
            });
        }
        const totalPat = allPatients[0]?.count || 0;
        const conf = parseFloat(avgConfidence[0]?.avg) || 0;
        const esc = escalationCount[0]?.count || 0;
        if (conf > 0) {
            insights.push({
                title: "Triage Accuracy Report",
                description: `AI triage model running at ${conf}% average confidence across ${totalPat} patients. ${esc} case${esc !== 1 ? "s" : ""} required escalation.`,
                type: "report",
                time: "Current",
            });
        }
        if (riskMap.Low > riskMap.High && riskMap.Low > riskMap.Medium) {
            insights.push({
                title: "Positive Risk Distribution",
                description: `Majority of patients (${riskMap.Low}) are classified as low risk. System is performing well at early detection.`,
                type: "success",
                time: "Current",
            });
        }

        return NextResponse.json({
            totalPatients: totalPat,
            newThisWeek: newThisWeek[0]?.count || 0,
            pendingCount: pendingCount[0]?.count || 0,
            assessments30d: assessments30d[0]?.count || 0,
            avgConfidence: conf,
            escalationCount: esc,
            riskDistribution: riskMap,
            weeklyAdmissions: weeklyFilled,
            departmentStats,
            recentPatients,
            insights,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
