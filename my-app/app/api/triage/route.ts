import { NextRequest, NextResponse } from "next/server";

interface TriageInput {
    age: number;
    gender: string;
    symptoms: string;
    blood_pressure: string;
    heart_rate: number;
    temperature: number;
    pre_existing_conditions: string;
}

interface TriageResult {
    risk_level: "High" | "Medium" | "Low";
    confidence_score: number;
    recommended_department: string;
    triage_notes: string;
    urgency_score: number;
}

/**
 * POST /api/triage
 * Triage service — accepts patient vitals, returns risk assessment.
 * This is a standalone service endpoint that can be swapped with a real
 * AI/ML model or external service in the future.
 */
export async function POST(request: NextRequest) {
    try {
        const data: TriageInput = await request.json();
        const { age, gender, symptoms, blood_pressure, heart_rate, temperature, pre_existing_conditions } = data;

        if (!blood_pressure || !heart_rate || !temperature) {
            return NextResponse.json({ error: "Vitals are required for triage." }, { status: 400 });
        }

        const result = runTriageEngine(age, gender, symptoms, blood_pressure, heart_rate, temperature, pre_existing_conditions);

        return NextResponse.json({ result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
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
                    temperature, pre_existing_conditions, risk_level, confidence_score,
                    recommended_department, triage_notes, urgency_score, status, created_at
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

// --- Triage Engine ---

function runTriageEngine(
    age: number,
    gender: string,
    symptoms: string,
    blood_pressure: string,
    heart_rate: number,
    temperature: number,
    pre_existing_conditions: string
): TriageResult {
    let urgencyScore = 0;
    const notes: string[] = [];

    // Parse blood pressure
    const [systolic, diastolic] = blood_pressure.split("/").map((v) => parseInt(v));

    // --- Vital Signs Scoring ---

    // Heart rate
    if (heart_rate > 120) { urgencyScore += 30; notes.push("Severe tachycardia detected"); }
    else if (heart_rate > 100) { urgencyScore += 20; notes.push("Tachycardia detected"); }
    else if (heart_rate < 50) { urgencyScore += 25; notes.push("Bradycardia detected"); }

    // Temperature
    if (temperature > 103) { urgencyScore += 30; notes.push("High fever (>103°F)"); }
    else if (temperature > 100.4) { urgencyScore += 15; notes.push("Fever detected"); }
    else if (temperature < 95) { urgencyScore += 25; notes.push("Hypothermia detected"); }

    // Blood pressure
    if (systolic > 180 || diastolic > 120) { urgencyScore += 30; notes.push("Hypertensive crisis"); }
    else if (systolic > 140 || diastolic > 90) { urgencyScore += 15; notes.push("Elevated blood pressure"); }
    else if (systolic < 90 || diastolic < 60) { urgencyScore += 25; notes.push("Hypotension detected"); }

    // --- Age Factor ---
    if (age > 70) { urgencyScore += 10; notes.push("Elderly patient — elevated risk"); }
    else if (age < 5) { urgencyScore += 10; notes.push("Pediatric patient — elevated risk"); }

    // --- Pre-existing Conditions ---
    const conditions = (pre_existing_conditions || "").toLowerCase();
    const highRiskConditions = ["diabetes", "heart disease", "cancer", "copd", "kidney", "liver", "hiv", "transplant"];
    const matchedConditions = highRiskConditions.filter((c) => conditions.includes(c));
    if (matchedConditions.length > 0) {
        urgencyScore += matchedConditions.length * 8;
        notes.push(`Pre-existing: ${matchedConditions.join(", ")}`);
    }

    // --- Symptom Keywords ---
    const symptomText = (symptoms || "").toLowerCase();
    const criticalSymptoms = ["chest pain", "breathing difficulty", "unconscious", "seizure", "stroke", "bleeding", "trauma", "cardiac arrest"];
    const moderateSymptoms = ["vomiting", "dizziness", "severe pain", "swelling", "infection", "fracture", "burn"];

    const criticalMatches = criticalSymptoms.filter((s) => symptomText.includes(s));
    const moderateMatches = moderateSymptoms.filter((s) => symptomText.includes(s));

    if (criticalMatches.length > 0) {
        urgencyScore += criticalMatches.length * 15;
        notes.push(`Critical symptoms: ${criticalMatches.join(", ")}`);
    }
    if (moderateMatches.length > 0) {
        urgencyScore += moderateMatches.length * 8;
        notes.push(`Notable symptoms: ${moderateMatches.join(", ")}`);
    }

    // --- Gender-specific ---
    if (gender === "Female" && symptomText.includes("pregnancy")) {
        urgencyScore += 10;
        notes.push("Pregnancy-related concern");
    }

    // --- Determine Risk Level ---
    let risk_level: "High" | "Medium" | "Low";
    if (urgencyScore >= 50) risk_level = "High";
    else if (urgencyScore >= 25) risk_level = "Medium";
    else risk_level = "Low";

    // Clamp urgency to 0–100
    urgencyScore = Math.min(100, Math.max(0, urgencyScore));

    // Confidence based on how much data we have
    const dataPoints = [symptoms, blood_pressure, heart_rate, temperature, pre_existing_conditions].filter(Boolean).length;
    const confidence_score = parseFloat((0.70 + dataPoints * 0.06).toFixed(2));

    // --- Department Recommendation ---
    let recommended_department = "General Outpatient";
    if (criticalMatches.some((s) => ["chest pain", "cardiac arrest"].includes(s))) recommended_department = "Cardiology / Emergency";
    else if (criticalMatches.some((s) => ["stroke", "seizure", "unconscious"].includes(s))) recommended_department = "Neurology / Emergency";
    else if (criticalMatches.some((s) => ["trauma", "bleeding"].includes(s))) recommended_department = "Emergency / Trauma";
    else if (criticalMatches.includes("breathing difficulty")) recommended_department = "Pulmonology / Emergency";
    else if (risk_level === "High") recommended_department = "Emergency (ER)";
    else if (risk_level === "Medium") recommended_department = "Internal Medicine";

    if (notes.length === 0) notes.push("Vitals within normal range");

    return {
        risk_level,
        confidence_score,
        recommended_department,
        triage_notes: notes.join(". ") + ".",
        urgency_score: urgencyScore,
    };
}
