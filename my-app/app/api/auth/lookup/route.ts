import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ found: false });
        }

        const sql = neon(process.env.DATABASE_URL!);

        const rows = await sql`
            SELECT u.full_name, o.name as org_name, o.type as org_type
            FROM users u
            JOIN organizations o ON u.org_id = o.id
            WHERE u.email = ${email}
        `;

        if (rows.length === 0) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({
            found: true,
            fullName: rows[0].full_name,
            orgName: rows[0].org_name,
            orgType: rows[0].org_type,
        });
    } catch {
        return NextResponse.json({ found: false });
    }
}
