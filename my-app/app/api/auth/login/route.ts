import { getSQL, rawQuery, getTenantSchema } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        const sql = getSQL();

        // 1. Check superadmins table first
        const superRows = await sql`
            SELECT id, email, password_hash, full_name
            FROM superadmins
            WHERE email = ${email}
        `;

        if (superRows.length > 0) {
            const admin = superRows[0];
            const valid = await bcrypt.compare(password, admin.password_hash);
            if (!valid) {
                return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
            }
            return NextResponse.json({
                message: "Login successful.",
                user: {
                    id: admin.id,
                    fullName: admin.full_name,
                    email: admin.email,
                    role: "superadmin",
                    orgId: null,
                    orgName: "Kairo Platform",
                },
            });
        }

        // 2. Look up org from user_directory
        const dirRows = await sql`
            SELECT ud.org_id, o.name as org_name
            FROM user_directory ud
            JOIN organizations o ON ud.org_id = o.id
            WHERE ud.email = ${email}
        `;

        if (dirRows.length === 0) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const orgId = dirRows[0].org_id;
        const orgName = dirRows[0].org_name;
        const schema = getTenantSchema(orgId);

        // 3. Query tenant schema for user
        const userRows = await rawQuery(`
            SELECT id, full_name, email, password_hash, role
            FROM ${schema}.users
            WHERE email = $1
        `, [email]);

        if (userRows.length === 0) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const user = userRows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        return NextResponse.json({
            message: "Login successful.",
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                orgId: orgId,
                orgName: orgName,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
