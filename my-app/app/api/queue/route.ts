import { NextRequest, NextResponse } from "next/server";

const ML_BACKEND = process.env.ML_BACKEND_URL || "http://localhost:8000";

/**
 * GET /api/queue
 * Get summary of all department queues from ML backend.
 */
export async function GET() {
    try {
        const mlRes = await fetch(`${ML_BACKEND}/queue/summary`);
        if (!mlRes.ok) {
            return NextResponse.json({ error: "ML queue service failed." }, { status: 502 });
        }
        const summary = await mlRes.json();
        return NextResponse.json(summary);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/queue
 * Admit a patient to the ML backend queue (triage + queue).
 */
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const mlPayload = {
            Patient_ID: data.patient_id || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
            Age: parseInt(data.age),
            Gender: data.gender,
            Symptoms: data.symptoms,
            Blood_Pressure: data.blood_pressure,
            Heart_Rate: parseFloat(data.heart_rate),
            Temperature: parseFloat(data.temperature),
            SpO2: parseFloat(data.spo2) || 98,
            Respiratory_Rate: parseFloat(data.respiratory_rate) || 16,
            Consciousness_Level: data.consciousness_level || "Alert",
            Pain_Level: parseInt(data.pain_level) || 5,
            Pre_Existing_Conditions: data.pre_existing_conditions || "None",
        };

        const mlRes = await fetch(`${ML_BACKEND}/queue/admit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mlPayload),
        });

        if (!mlRes.ok) {
            const errText = await mlRes.text();
            console.error("ML queue admit error:", errText);
            return NextResponse.json({ error: "ML queue admit failed." }, { status: 502 });
        }

        const result = await mlRes.json();
        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
