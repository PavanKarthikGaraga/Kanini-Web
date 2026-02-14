import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const orgId = req.headers.get("x-org-id");
    const sql = neon(process.env.DATABASE_URL!);

    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    try {
        const patient = await sql`SELECT * FROM patients WHERE id = ${id} AND org_id = ${orgId}`;
        if (patient.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }
        return NextResponse.json(patient[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
