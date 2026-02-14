import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const sql = neon(process.env.DATABASE_URL!);
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

    // --- Mock Risk Engine ---
    let riskLevel = "Low";
    const hr = parseInt(heart_rate);
    const temp = parseFloat(temperature);
    const [systolic] = blood_pressure.split("/").map((v: string) => parseInt(v));

    if (temp > 102 || hr > 110 || systolic > 160 || systolic < 90) {
        riskLevel = "High";
    } else if (temp > 100 || hr > 90 || systolic > 140 || systolic < 100) {
        riskLevel = "Medium";
    }

    const confidenceScore = (Math.random() * (0.98 - 0.85) + 0.85).toFixed(2);

    let recommendedDept = "General Outpatient";
    if (riskLevel === "High") recommendedDept = "Emergency (ER)";
    else if (riskLevel === "Medium") recommendedDept = "Internal Medicine";

    const displayId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
        const result = await sql`
            INSERT INTO patients (
                org_id,
                patient_id_display,
                age,
                gender,
                symptoms,
                blood_pressure,
                heart_rate,
                temperature,
                pre_existing_conditions,
                risk_level,
                confidence_score,
                recommended_department,
                status
            ) VALUES (
                ${org_id},
                ${displayId},
                ${age},
                ${gender},
                ${symptoms},
                ${blood_pressure},
                ${heart_rate},
                ${temperature},
                ${pre_existing_conditions},
                ${riskLevel},
                ${confidenceScore},
                ${recommendedDept},
                'Pending'
            )
            RETURNING id
        `;

        return NextResponse.json({ id: result[0].id, displayId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const sql = neon(process.env.DATABASE_URL!);
    const orgId = req.headers.get("x-org-id");

    if (!orgId) {
        return NextResponse.json({ error: "x-org-id header is required" }, { status: 400 });
    }

    try {
        const patients = await sql`SELECT * FROM patients WHERE org_id = ${orgId} ORDER BY created_at DESC`;
        return NextResponse.json(patients);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
