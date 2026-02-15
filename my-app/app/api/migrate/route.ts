import { NextResponse } from "next/server";
import { rawExec, rawQuery } from "@/app/lib/db";

/**
 * GET /api/migrate
 * Adds the new ML-related columns to all existing tenant patient tables.
 * Safe to run multiple times (uses IF NOT EXISTS).
 */
export async function GET() {
    try {
        // Get all tenant schemas
        const schemas = await rawQuery(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'`,
            []
        );

        const newColumns = [
            { name: "spo2", def: "DECIMAL(5,2) DEFAULT 98" },
            { name: "respiratory_rate", def: "DECIMAL(5,2) DEFAULT 16" },
            { name: "consciousness_level", def: "TEXT DEFAULT 'Alert'" },
            { name: "pain_level", def: "INTEGER DEFAULT 5" },
            { name: "dept_confidence", def: "DECIMAL(5,4)" },
            { name: "needs_escalation", def: "BOOLEAN DEFAULT FALSE" },
            { name: "escalation_reason", def: "TEXT" },
            { name: "news2_score", def: "DECIMAL(5,2)" },
            { name: "risk_probabilities", def: "JSONB" },
            { name: "dept_probabilities", def: "JSONB" },
        ];

        const results: string[] = [];

        for (const row of schemas) {
            const schema = row.schema_name;
            for (const col of newColumns) {
                try {
                    await rawExec(
                        `ALTER TABLE ${schema}.patients ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}`
                    );
                } catch {
                    // Column might already exist, that's fine
                }
            }

            // Add assigned_doctor_id to patients
            try {
                await rawExec(
                    `ALTER TABLE ${schema}.patients ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID`
                );
            } catch {
                // Column might already exist
            }

            // Create doctors table
            try {
                await rawExec(`
                    CREATE TABLE IF NOT EXISTS ${schema}.doctors (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        org_id UUID NOT NULL,
                        full_name TEXT NOT NULL,
                        specialization TEXT NOT NULL,
                        department TEXT NOT NULL,
                        phone TEXT,
                        email TEXT,
                        status TEXT DEFAULT 'Available',
                        max_patients INTEGER DEFAULT 5,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `);
            } catch {
                // Table might already exist
            }

            results.push(`Migrated ${schema}`);
        }

        return NextResponse.json({
            message: "Migration complete",
            migrated: results,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
