import { rawQuery, getTenantSchema } from "@/app/lib/db";
import { NextResponse } from "next/server";

/**
 * POST /api/doctors/assign
 * Auto-assigns available doctors to unassigned high-risk patients.
 * Priority: High > Medium > Low. Matches by department.
 * Respects each doctor's max_patients limit.
 */
export async function POST(req: Request) {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    const schema = getTenantSchema(orgId);

    try {
        // Get unassigned patients ordered by severity (High first, then urgency_score desc)
        const unassigned = await rawQuery(`
            SELECT id, risk_level, recommended_department, urgency_score
            FROM ${schema}.patients
            WHERE org_id = $1
              AND assigned_doctor_id IS NULL
            ORDER BY
                CASE risk_level WHEN 'High' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END,
                urgency_score DESC
        `, [orgId]);

        // Get available doctors with their current load
        const doctors = await rawQuery(`
            SELECT d.id, d.department, d.max_patients, d.status,
                (SELECT COUNT(*)::int FROM ${schema}.patients p WHERE p.assigned_doctor_id = d.id) AS current_load
            FROM ${schema}.doctors d
            WHERE d.org_id = $1 AND d.status = 'Available'
            ORDER BY d.department
        `, [orgId]);

        let assignedCount = 0;
        const assignments: { patient_id: string; doctor_id: string; risk_level: string }[] = [];

        // Track load changes during this batch
        const loadDelta: Record<string, number> = {};

        for (const patient of unassigned) {
            // Find a matching doctor (same department, under capacity)
            const dept = patient.recommended_department;
            const match = doctors.find((d) => {
                const currentLoad = d.current_load + (loadDelta[d.id] || 0);
                return d.department === dept && currentLoad < d.max_patients;
            });

            if (match) {
                await rawQuery(
                    `UPDATE ${schema}.patients SET assigned_doctor_id = $1 WHERE id = $2`,
                    [match.id, patient.id]
                );
                loadDelta[match.id] = (loadDelta[match.id] || 0) + 1;
                assignedCount++;
                assignments.push({
                    patient_id: patient.id,
                    doctor_id: match.id,
                    risk_level: patient.risk_level,
                });
            }
        }

        return NextResponse.json({
            assignedCount,
            unassignedRemaining: unassigned.length - assignedCount,
            assignments,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
