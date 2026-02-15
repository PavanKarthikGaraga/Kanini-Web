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
        spo2,
        respiratory_rate,
        consciousness_level,
        pain_level,
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
            body: JSON.stringify({
                age: parseInt(age),
                gender,
                symptoms,
                blood_pressure,
                heart_rate: parseInt(heart_rate),
                temperature: parseFloat(temperature),
                spo2: parseFloat(spo2) || 98,
                respiratory_rate: parseFloat(respiratory_rate) || 16,
                consciousness_level: consciousness_level || "Alert",
                pain_level: parseInt(pain_level) || 5,
                pre_existing_conditions,
            }),
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
                blood_pressure, heart_rate, temperature,
                spo2, respiratory_rate, consciousness_level, pain_level,
                pre_existing_conditions,
                risk_level, confidence_score, recommended_department,
                triage_notes, urgency_score,
                dept_confidence, needs_escalation, escalation_reason, news2_score,
                risk_probabilities, dept_probabilities,
                status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, 'Pending'
            )
            RETURNING id
        `, [
            org_id, displayId, age, gender, symptoms,
            blood_pressure, heart_rate, temperature,
            spo2 || 98, respiratory_rate || 16, consciousness_level || "Alert", pain_level || 5,
            pre_existing_conditions,
            triageResult.risk_level, triageResult.confidence_score, triageResult.recommended_department,
            triageResult.triage_notes, triageResult.urgency_score,
            triageResult.dept_confidence, triageResult.needs_escalation, triageResult.escalation_reason,
            triageResult.news2_score,
            JSON.stringify(triageResult.risk_probabilities), JSON.stringify(triageResult.dept_probabilities),
        ]);

        // Also admit to ML queue for live queue / department views
        try {
            await fetch(`${process.env.ML_BACKEND_URL || "http://localhost:8000"}/queue/admit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Patient_ID: displayId,
                    Age: parseInt(age),
                    Gender: gender,
                    Symptoms: symptoms,
                    Blood_Pressure: blood_pressure,
                    Heart_Rate: parseFloat(heart_rate),
                    Temperature: parseFloat(temperature),
                    SpO2: parseFloat(spo2) || 98,
                    Respiratory_Rate: parseFloat(respiratory_rate) || 16,
                    Consciousness_Level: consciousness_level || "Alert",
                    Pain_Level: parseInt(pain_level) || 5,
                    Pre_Existing_Conditions: pre_existing_conditions || "None",
                }),
            });
        } catch {
            // Queue admission is non-critical, don't block patient creation
        }

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
