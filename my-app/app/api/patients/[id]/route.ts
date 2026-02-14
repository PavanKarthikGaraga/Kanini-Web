import { rawQuery, getTenantSchema } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const orgId = req.headers.get("x-org-id");

    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    const schema = getTenantSchema(orgId);

    try {
        const patient = await rawQuery(`SELECT * FROM ${schema}.patients WHERE id = $1 AND org_id = $2`, [id, orgId]);
        if (patient.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }
        return NextResponse.json(patient[0]);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
