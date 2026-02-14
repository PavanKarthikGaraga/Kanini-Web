import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL = "postgresql://neondb_owner:npg_6Ov1WFCtErkb@ep-delicate-bird-aitcnl2w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

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

    console.log("  Created: organizations, superadmins, user_directory");

    // 4. Seed superadmin
    console.log("[4/5] Seeding superadmin...");
    const passwordHash = await bcrypt.hash("SuperAdmin@123", 12);
    await sql`
        INSERT INTO superadmins (email, password_hash, full_name)
        VALUES ('superadmin@kairo.dev', ${passwordHash}, 'Kairo Super Admin')
    `;
    console.log("  Superadmin created:");
    console.log("    Email:    superadmin@kairo.dev");
    console.log("    Password: SuperAdmin@123");

    // 5. Done
    console.log("[5/5] Verification...");
    const orgCount = await sql`SELECT COUNT(*)::int as count FROM organizations`;
    const superCount = await sql`SELECT COUNT(*)::int as count FROM superadmins`;
    const dirCount = await sql`SELECT COUNT(*)::int as count FROM user_directory`;
    console.log(`  organizations: ${orgCount[0].count} rows`);
    console.log(`  superadmins:   ${superCount[0].count} rows`);
    console.log(`  user_directory: ${dirCount[0].count} rows`);

    console.log("\n=== Done! DB reset and superadmin seeded. ===");
    console.log("Login at /auth/login with superadmin@kairo.dev / SuperAdmin@123");
}

resetDB().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
});
