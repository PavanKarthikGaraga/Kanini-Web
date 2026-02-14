import { getSQL } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
    const sql = getSQL();

    try {
        const existing = await sql`SELECT id FROM superadmins LIMIT 1`;
        if (existing.length > 0) {
            return NextResponse.json({ message: "Superadmin already exists." });
        }

        const passwordHash = await bcrypt.hash("SuperAdmin@123", 12);

        await sql`
            INSERT INTO superadmins (email, password_hash, full_name)
            VALUES ('superadmin@kairo.dev', ${passwordHash}, 'Kairo Super Admin')
        `;

        return NextResponse.json({ message: "Superadmin created successfully. Email: superadmin@kairo.dev / Password: SuperAdmin@123" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
