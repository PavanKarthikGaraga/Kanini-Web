import { rawQuery, getTenantSchema } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    const schema = getTenantSchema(orgId);

    try {
        const doctors = await rawQuery(
            `SELECT d.*,
                (SELECT COUNT(*)::int FROM ${schema}.patients p WHERE p.assigned_doctor_id = d.id) AS assigned_count
             FROM ${schema}.doctors d
             WHERE d.org_id = $1
             ORDER BY d.created_at DESC`,
            [orgId]
        );
        return NextResponse.json(doctors);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const data = await req.json();
    const { org_id, full_name, specialization, department, phone, email, max_patients } = data;

    if (!org_id) {
        return NextResponse.json({ error: "org_id is required" }, { status: 400 });
    }
    if (!full_name || !specialization || !department) {
        return NextResponse.json({ error: "full_name, specialization, and department are required" }, { status: 400 });
    }

    const schema = getTenantSchema(org_id);

    try {
        const result = await rawQuery(`
            INSERT INTO ${schema}.doctors (org_id, full_name, specialization, department, phone, email, max_patients)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [org_id, full_name, specialization, department, phone || null, email || null, max_patients || 5]);

        return NextResponse.json(result[0]);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { org_id, doctor_id } = await req.json();

    if (!org_id || !doctor_id) {
        return NextResponse.json({ error: "org_id and doctor_id are required" }, { status: 400 });
    }

    const schema = getTenantSchema(org_id);

    try {
        // Unassign from patients first
        await rawQuery(
            `UPDATE ${schema}.patients SET assigned_doctor_id = NULL WHERE assigned_doctor_id = $1`,
            [doctor_id]
        );
        await rawQuery(
            `DELETE FROM ${schema}.doctors WHERE id = $1 AND org_id = $2`,
            [doctor_id, org_id]
        );
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
