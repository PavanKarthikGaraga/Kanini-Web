import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL = "postgresql://neondb_owner:npg_6Ov1WFCtErkb@ep-delicate-bird-aitcnl2w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

/**
 * Creates tenant schema with all tables (mirrors db.ts createTenantSchema).
 * Call this after inserting an org to initialize its schema.
 */
async function createTenantSchema(orgId) {
    const schema = `tenant_${orgId.replace(/-/g, "_")}`;

    await sql`${sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${schema}`)}`;

    await sql`${sql.unsafe(`
        CREATE TABLE IF NOT EXISTS ${schema}.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT NOW()
        )
    `)}`;

    await sql`${sql.unsafe(`
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
    `)}`;

    await sql`${sql.unsafe(`
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
    `)}`;

    return schema;
}

async function resetDB() {
    console.log("=== Kairo DB Reset & Seed Script ===\n");

    // 1. Drop all tenant schemas
    console.log("[1/5] Dropping all tenant schemas...");
    const schemas = await sql`
        SELECT schema_name FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant_%'
    `;
    for (const s of schemas) {
        await sql`${sql.unsafe(`DROP SCHEMA IF EXISTS ${s.schema_name} CASCADE`)}`;
        console.log(`  Dropped schema: ${s.schema_name}`);
    }
    if (schemas.length === 0) console.log("  No tenant schemas found.");

    // 2. Drop existing public tables (in correct order due to foreign keys)
    console.log("[2/5] Dropping existing public tables...");
    await sql`DROP TABLE IF EXISTS user_directory CASCADE`;
    await sql`DROP TABLE IF EXISTS doctors CASCADE`;
    await sql`DROP TABLE IF EXISTS patients CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    await sql`DROP TABLE IF EXISTS superadmins CASCADE`;
    await sql`DROP TABLE IF EXISTS organizations CASCADE`;
    console.log("  All public tables dropped.");

    // 3. Create public schema tables
    console.log("[3/5] Creating public schema tables...");

    await sql`
        CREATE TABLE organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            phone TEXT NOT NULL,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            country TEXT NOT NULL DEFAULT 'India',
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE superadmins (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE user_directory (
            email TEXT PRIMARY KEY,
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
        )
    `;

    await sql`
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE patients (
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
    `;

    await sql`
        CREATE TABLE doctors (
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
    `;

    console.log("  Created: organizations, superadmins, user_directory, users, patients, doctors");

    // 4. Seed superadmin
    console.log("[4/7] Seeding superadmin...");
    const superPasswordHash = await bcrypt.hash("SuperAdmin@123", 12);
    await sql`
        INSERT INTO superadmins (email, password_hash, full_name)
        VALUES ('superadmin@kairo.dev', ${superPasswordHash}, 'Kairo Super Admin')
    `;
    console.log("  Superadmin created:");
    console.log("    Email:    superadmin@kairo.dev");
    console.log("    Password: SuperAdmin@123");

    // 5. Seed demo organization
    console.log("[5/7] Seeding demo organization...");
    const orgRows = await sql`
        INSERT INTO organizations (name, type, phone, street, city, state, pincode, country)
        VALUES ('Kairo Demo Hospital', 'Hospital', '+91 98765 43210', '123 Health Street', 'Bangalore', 'Karnataka', '560001', 'India')
        RETURNING id
    `;
    const orgId = orgRows[0].id;
    console.log(`  Organization created: Kairo Demo Hospital (${orgId})`);

    // 6. Create tenant schema with all tables (users, patients, doctors)
    console.log("[6/7] Creating tenant schema & tables...");
    const schemaName = await createTenantSchema(orgId);
    console.log(`  Created schema: ${schemaName}`);
    console.log("  Created tables: users, patients, doctors");

    // Seed demo admin user in tenant
    const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
    await sql`${sql.unsafe(`
        INSERT INTO ${schemaName}.users (org_id, full_name, email, password_hash, role)
        VALUES ('${orgId}', 'Demo Admin', 'admin@kairo.dev', '${adminPasswordHash}', 'admin')
    `)}`;
    await sql`
        INSERT INTO user_directory (email, org_id)
        VALUES ('admin@kairo.dev', ${orgId})
    `;
    console.log("  Demo admin created:");
    console.log("    Email:    admin@kairo.dev");
    console.log("    Password: Admin@123");

    // 7. Verification
    console.log("[7/7] Verification...");
    const orgCount = await sql`SELECT COUNT(*)::int as count FROM organizations`;
    const superCount = await sql`SELECT COUNT(*)::int as count FROM superadmins`;
    const dirCount = await sql`SELECT COUNT(*)::int as count FROM user_directory`;

    // Verify tenant tables exist
    const tenantTables = await sql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = ${schemaName}
        ORDER BY table_name
    `;
    console.log(`  organizations:  ${orgCount[0].count} rows`);
    console.log(`  superadmins:    ${superCount[0].count} rows`);
    console.log(`  user_directory: ${dirCount[0].count} rows`);
    console.log(`  tenant tables:  ${tenantTables.map(t => t.table_name).join(", ")}`);

    console.log("\n=== Done! DB reset and seeded. ===");
    console.log("Superadmin: superadmin@kairo.dev / SuperAdmin@123");
    console.log("Demo Admin: admin@kairo.dev / Admin@123");
}

resetDB().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
});
