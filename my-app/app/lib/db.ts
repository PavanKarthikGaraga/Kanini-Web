import { neon } from "@neondatabase/serverless";

export function getSQL() {
    return neon(process.env.DATABASE_URL!);
}

/**
 * Returns the sanitized schema name for a tenant.
 * Format: tenant_<uuid_with_hyphens_replaced_by_underscores>
 */
export function getTenantSchema(orgId: string): string {
    const sanitized = orgId.replace(/-/g, "_");
    return `tenant_${sanitized}`;
}

/**
 * Executes a dynamic SQL query with schema-qualified table names.
 * Uses tagged template with sql.unsafe() for the dynamic parts.
 * For parameterized values, pass them and they'll be substituted.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
    const sql = getSQL();
    // Replace $1, $2 etc with actual parameterized values using tagged template
    // We need to split the query by parameter placeholders and rebuild as tagged template
    const parts = query.split(/\$(\d+)/);
    const strings: string[] = [];
    const values: any[] = [];

    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            // Static SQL part
            strings.push(parts[i]);
        } else {
            // Parameter index (1-based)
            const paramIndex = parseInt(parts[i]) - 1;
            values.push(params[paramIndex]);
        }
    }

    // Create a tagged template array
    const templateStrings = Object.assign([...strings], { raw: strings }) as unknown as TemplateStringsArray;
    return sql(templateStrings, ...values);
}

/**
 * Executes raw DDL SQL (CREATE SCHEMA, CREATE TABLE, etc.) with no parameters.
 * Uses sql.unsafe() for schema/table name interpolation.
 */
export async function rawExec(query: string): Promise<any> {
    const sql = getSQL();
    return sql`${sql.unsafe(query)}`;
}

/**
 * Creates a new schema for a tenant with users and patients tables.
 */
export async function createTenantSchema(orgId: string) {
    const schema = getTenantSchema(orgId);

    await rawExec(`CREATE SCHEMA IF NOT EXISTS ${schema}`);

    await rawExec(`
        CREATE TABLE IF NOT EXISTS ${schema}.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await rawExec(`
        CREATE TABLE IF NOT EXISTS ${schema}.patients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL,
            patient_id_display TEXT UNIQUE,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            symptoms TEXT NOT NULL,
            blood_pressure TEXT NOT NULL,
            heart_rate INTEGER NOT NULL,
            temperature DECIMAL(5,2) NOT NULL,
            spo2 DECIMAL(5,2) DEFAULT 98,
            respiratory_rate DECIMAL(5,2) DEFAULT 16,
            consciousness_level TEXT DEFAULT 'Alert',
            pain_level INTEGER DEFAULT 5,
            pre_existing_conditions TEXT,
            risk_level TEXT DEFAULT 'Low',
            confidence_score DECIMAL(5,2),
            recommended_department TEXT,
            triage_notes TEXT,
            urgency_score INTEGER DEFAULT 0,
            dept_confidence DECIMAL(5,4),
            needs_escalation BOOLEAN DEFAULT FALSE,
            escalation_reason TEXT,
            news2_score DECIMAL(5,2),
            risk_probabilities JSONB,
            dept_probabilities JSONB,
            status TEXT DEFAULT 'Pending',
            assigned_doctor_id UUID,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

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
}
