import { getSQL, rawQuery, getTenantSchema } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/tenants/users?orgId=xxx — List users for an org
export async function GET(request: NextRequest) {
    const orgId = request.nextUrl.searchParams.get("orgId");

    if (!orgId) {
        return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const schema = getTenantSchema(orgId);

    try {
        const users = await rawQuery(
            `SELECT id, full_name, email, role, created_at FROM ${schema}.users WHERE org_id = $1 ORDER BY created_at DESC`,
            [orgId]
        );
        return NextResponse.json({ users });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/admin/tenants/users — Add a user to an org
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orgId, fullName, email, password, role } = body;

        if (!orgId || !fullName || !email || !password) {
            return NextResponse.json({ error: "orgId, fullName, email, and password are required." }, { status: 400 });
        }

        const sql = getSQL();
        const schema = getTenantSchema(orgId);
        const userRole = role || "admin";

        // Check if email already exists
        const existingDir = await sql`SELECT email FROM user_directory WHERE email = ${email}`;
        const existingSuper = await sql`SELECT email FROM superadmins WHERE email = ${email}`;
        if (existingDir.length > 0 || existingSuper.length > 0) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        // Create user in tenant schema
        const passwordHash = await bcrypt.hash(password, 12);
        await rawQuery(`
            INSERT INTO ${schema}.users (org_id, full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4, $5)
        `, [orgId, fullName, email, passwordHash, userRole]);

        // Register in user_directory
        await sql`INSERT INTO user_directory (email, org_id) VALUES (${email}, ${orgId})`;

        return NextResponse.json({ message: "User added successfully." }, { status: 201 });
    } catch (error: unknown) {
        console.error("Add user error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE /api/admin/tenants/users — Remove a user from an org
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { orgId, userId, email } = body;

        if (!orgId || !userId || !email) {
            return NextResponse.json({ error: "orgId, userId, and email are required." }, { status: 400 });
        }

        const sql = getSQL();
        const schema = getTenantSchema(orgId);

        await rawQuery(`DELETE FROM ${schema}.users WHERE id = $1 AND org_id = $2`, [userId, orgId]);
        await sql`DELETE FROM user_directory WHERE email = ${email}`;

        return NextResponse.json({ message: "User removed successfully." });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
