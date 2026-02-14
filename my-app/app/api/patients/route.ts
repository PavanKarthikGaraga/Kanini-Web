import { rawQuery, getTenantSchema } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json();

    const {
        org_id,
        age,
        gender,
        symptoms,
        blood_pressure,
        heart_rate,
        temperature,
        pre_existing_conditions
    } = data;

    if (!org_id) {
        return NextResponse.json({ error: "org_id is required" }, { status: 400 });
    }

    // --- Call Triage Service ---
    let triageResult;
    try {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.startsWith("localhost") ? "http" : "https";
        const triageRes = await fetch(`${protocol}://${host}/api/triage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ age: parseInt(age), gender, symptoms, blood_pressure, heart_rate: parseInt(heart_rate), temperature: parseFloat(temperature), pre_existing_conditions }),
        });
        const triageData = await triageRes.json();
        if (!triageRes.ok) {
            return NextResponse.json({ error: triageData.error || "Triage service failed." }, { status: 500 });
        }
        triageResult = triageData.result;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Triage service unavailable";
        return NextResponse.json({ error: message }, { status: 500 });
    }

    const displayId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const schema = getTenantSchema(org_id);

    try {
        const result = await rawQuery(`
            INSERT INTO ${schema}.patients (
                org_id, patient_id_display, age, gender, symptoms,
                blood_pressure, heart_rate, temperature, pre_existing_conditions,
                risk_level, confidence_score, recommended_department,
                triage_notes, urgency_score, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Pending'
            )
            RETURNING id
        `, [
            org_id, displayId, age, gender, symptoms,
            blood_pressure, heart_rate, temperature, pre_existing_conditions,
            triageResult.risk_level, triageResult.confidence_score, triageResult.recommended_department,
            triageResult.triage_notes, triageResult.urgency_score
        ]);

        return NextResponse.json({
            id: result[0].id,
            displayId,
            triage: triageResult,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const orgId = req.headers.get("x-org-id");

    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    const schema = getTenantSchema(orgId);

    try {
        const patients = await rawQuery(
            `SELECT * FROM ${schema}.patients WHERE org_id = $1 ORDER BY created_at DESC`,
            [orgId]
        );
        return NextResponse.json(patients);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
