import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL!);

        const rows = await sql`
            SELECT u.id, u.full_name, u.email, u.password_hash, u.role,
                   o.id as org_id, o.name as org_name
            FROM users u
            JOIN organizations o ON u.org_id = o.id
            WHERE u.email = ${email}
        `;

        if (rows.length === 0) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const user = rows[0];
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
                orgId: user.org_id,
                orgName: user.org_name,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
