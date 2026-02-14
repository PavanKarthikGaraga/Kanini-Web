import { getSQL, rawQuery, getTenantSchema, createTenantSchema } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const sql = getSQL();

    try {
        const tenants = await sql`
            SELECT o.*,
                (SELECT COUNT(*)::int FROM user_directory ud WHERE ud.org_id = o.id) as user_count
            FROM organizations o
            ORDER BY o.created_at DESC
        `;

        return NextResponse.json({ tenants });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orgName, orgType, orgPhone,
            street, city, state, pincode, country,
            fullName, email, password,
        } = body;

        if (!orgName || !orgType || !orgPhone || !street || !city || !state || !pincode || !fullName || !email || !password) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        const sql = getSQL();

        // Check if email already exists
        const existingDir = await sql`SELECT email FROM user_directory WHERE email = ${email}`;
        const existingSuper = await sql`SELECT email FROM superadmins WHERE email = ${email}`;
        if (existingDir.length > 0 || existingSuper.length > 0) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        // Create organization
        const orgRows = await sql`
            INSERT INTO organizations (name, type, phone, street, city, state, pincode, country)
            VALUES (${orgName}, ${orgType}, ${orgPhone}, ${street}, ${city}, ${state}, ${pincode}, ${country || "India"})
            RETURNING id
        `;
        const orgId = orgRows[0].id;

        // Create tenant schema
        await createTenantSchema(orgId);

        const schema = getTenantSchema(orgId);

        // Create admin user in tenant schema
        const passwordHash = await bcrypt.hash(password, 12);
        await rawQuery(`
            INSERT INTO ${schema}.users (org_id, full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4, 'admin')
        `, [orgId, fullName, email, passwordHash]);

        // Register in user_directory
        await sql`
            INSERT INTO user_directory (email, org_id)
            VALUES (${email}, ${orgId})
        `;

        return NextResponse.json({ message: "Tenant created successfully.", orgId }, { status: 201 });
    } catch (error: unknown) {
        console.error("Create tenant error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
