import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
    const sql = neon(process.env.DATABASE_URL!);

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS patients (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                patient_id_display TEXT UNIQUE,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                symptoms TEXT NOT NULL,
                blood_pressure TEXT NOT NULL,
                heart_rate INTEGER NOT NULL,
                temperature DECIMAL(5,2) NOT NULL,
                pre_existing_conditions TEXT,
                risk_level TEXT DEFAULT 'Low',
                confidence_score DECIMAL(5,2),
                recommended_department TEXT,
                status TEXT DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;

        await sql`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'patients' AND column_name = 'org_id'
                ) THEN
                    ALTER TABLE patients ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
                END IF;
            END
            $$;
        `;

        return NextResponse.json({ message: "Patients table created successfully with org_id" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
