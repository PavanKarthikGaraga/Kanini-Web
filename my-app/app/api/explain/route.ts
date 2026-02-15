import { NextRequest, NextResponse } from "next/server";

const ML_BACKEND = process.env.ML_BACKEND_URL || "http://localhost:8000";

/**
 * POST /api/explain
 * Proxies to ML backend for SHAP feature importance explanation.
 */
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const {
            age, gender, symptoms, blood_pressure, heart_rate, temperature,
            spo2, respiratory_rate, consciousness_level, pain_level,
            pre_existing_conditions
        } = data;

        const mlPayload = {
            Patient_ID: data.patient_id || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
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
        };

        const mlRes = await fetch(`${ML_BACKEND}/explain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mlPayload),
        });

        if (!mlRes.ok) {
            const errText = await mlRes.text();
            console.error("ML explain error:", errText);
            return NextResponse.json({ error: "ML explain service failed." }, { status: 502 });
        }

        const result = await mlRes.json();
        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
