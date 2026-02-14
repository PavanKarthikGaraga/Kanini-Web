import { getSQL } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const sql = getSQL();

    // Organizations table (shared across all tenants)
    await sql`
        CREATE TABLE IF NOT EXISTS organizations (
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

    // Superadmins table (platform-level admins)
    await sql`
        CREATE TABLE IF NOT EXISTS superadmins (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;

    // User directory for email → org_id lookup (avoids scanning all tenant schemas)
    await sql`
        CREATE TABLE IF NOT EXISTS user_directory (
            email TEXT PRIMARY KEY,
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
        )
    `;

    return NextResponse.json({ message: "Public schema tables created successfully (organizations, superadmins, user_directory)" });
}
