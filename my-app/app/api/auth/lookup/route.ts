import { getSQL, rawQuery, getTenantSchema } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ found: false });
        }

        const sql = getSQL();

        // Check superadmins first
        const superRows = await sql`
            SELECT full_name FROM superadmins WHERE email = ${email}
        `;
        if (superRows.length > 0) {
            return NextResponse.json({
                found: true,
                fullName: superRows[0].full_name,
                orgName: "Kairo Platform",
                orgType: "superadmin",
            });
        }

        // Look up from user_directory → tenant schema
        const dirRows = await sql`
            SELECT ud.org_id, o.name as org_name, o.type as org_type
            FROM user_directory ud
            JOIN organizations o ON ud.org_id = o.id
            WHERE ud.email = ${email}
        `;

        if (dirRows.length === 0) {
            return NextResponse.json({ found: false });
        }

        const orgId = dirRows[0].org_id;
        const schema = getTenantSchema(orgId);

        const userRows = await rawQuery(`
            SELECT full_name FROM ${schema}.users WHERE email = $1
        `, [email]);

        if (userRows.length === 0) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({
            found: true,
            fullName: userRows[0].full_name,
            orgName: dirRows[0].org_name,
            orgType: dirRows[0].org_type,
        });
    } catch {
        return NextResponse.json({ found: false });
    }
}
