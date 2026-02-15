import { NextRequest, NextResponse } from "next/server";

const ML_BACKEND = process.env.ML_BACKEND_URL || "http://localhost:8000";

interface TriageInput {
    age: number;
    gender: string;
    symptoms: string;
    blood_pressure: string;
    heart_rate: number;
    temperature: number;
    spo2: number;
    respiratory_rate: number;
    consciousness_level: string;
    pain_level: number;
    pre_existing_conditions: string;
}

/**
 * POST /api/triage
 * Proxies to the ML FastAPI backend for real AI-powered triage.
 */
export async function POST(request: NextRequest) {
    try {
        const data: TriageInput = await request.json();
        const {
            age, gender, symptoms, blood_pressure, heart_rate, temperature,
            spo2, respiratory_rate, consciousness_level, pain_level,
            pre_existing_conditions
        } = data;

        if (!blood_pressure || !heart_rate || !temperature) {
            return NextResponse.json({ error: "Vitals are required for triage." }, { status: 400 });
        }

        // Build the Patient_ID for the ML backend
        const patientId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;

        // Call ML backend
        const mlPayload = {
            Patient_ID: patientId,
            Age: age,
            Gender: gender,
            Symptoms: symptoms,
            Blood_Pressure: blood_pressure,
            Heart_Rate: heart_rate,
            Temperature: temperature,
            SpO2: spo2 ?? 98,
            Respiratory_Rate: respiratory_rate ?? 16,
            Consciousness_Level: consciousness_level || "Alert",
            Pain_Level: pain_level ?? 5,
            Pre_Existing_Conditions: pre_existing_conditions || "None",
        };

        const mlRes = await fetch(`${ML_BACKEND}/triage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mlPayload),
        });

        if (!mlRes.ok) {
            const errText = await mlRes.text();
            console.error("ML backend error:", errText);
            return NextResponse.json({ error: "ML triage service failed." }, { status: 502 });
        }

        const mlResult = await mlRes.json();

        // Map ML response to the web app format
        const result = {
            risk_level: mlResult.risk_level,
            confidence_score: mlResult.confidence,
            recommended_department: mlResult.department,
            triage_notes: buildTriageNotes(mlResult),
            urgency_score: Math.round(mlResult.priority_score),
            // Extra ML fields
            dept_confidence: mlResult.dept_confidence,
            needs_escalation: mlResult.needs_escalation,
            escalation_reason: mlResult.escalation_reason,
            news2_score: mlResult.news2_score,
            risk_probabilities: mlResult.risk_probabilities,
            dept_probabilities: mlResult.dept_probabilities,
        };

        return NextResponse.json({ result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Triage proxy error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * GET /api/triage?patientId=xxx&orgId=xxx
 * Fetch triage result for an existing patient from the database.
 */
export async function GET(request: NextRequest) {
    const patientId = request.nextUrl.searchParams.get("patientId");
    const orgId = request.nextUrl.searchParams.get("orgId");

    if (!patientId || !orgId) {
        return NextResponse.json({ error: "patientId and orgId are required." }, { status: 400 });
    }

    const { rawQuery, getTenantSchema } = await import("@/app/lib/db");
    const schema = getTenantSchema(orgId);

    try {
        const rows = await rawQuery(
            `SELECT id, patient_id_display, age, gender, symptoms, blood_pressure, heart_rate,
                    temperature, spo2, respiratory_rate, consciousness_level, pain_level,
                    pre_existing_conditions, risk_level, confidence_score,
                    recommended_department, triage_notes, urgency_score,
                    dept_confidence, needs_escalation, escalation_reason, news2_score,
                    risk_probabilities, dept_probabilities,
                    status, created_at
             FROM ${schema}.patients WHERE id = $1 AND org_id = $2`,
            [patientId, orgId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Patient not found." }, { status: 404 });
        }

        return NextResponse.json({ patient: rows[0] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function buildTriageNotes(mlResult: Record<string, unknown>): string {
    const notes: string[] = [];
    notes.push(`Risk: ${mlResult.risk_level} (confidence ${((mlResult.confidence as number) * 100).toFixed(0)}%)`);
    notes.push(`Routed to ${mlResult.department} (${((mlResult.dept_confidence as number) * 100).toFixed(0)}% confidence)`);
    notes.push(`NEWS2 Score: ${mlResult.news2_score}`);
    notes.push(`Priority Score: ${(mlResult.priority_score as number).toFixed(1)}/100`);
    if (mlResult.needs_escalation) {
        notes.push(`ESCALATION NEEDED: ${mlResult.escalation_reason}`);
    }
    return notes.join(". ") + ".";
}
