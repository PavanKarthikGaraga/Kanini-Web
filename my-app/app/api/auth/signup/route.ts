import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

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

        const sql = neon(process.env.DATABASE_URL!);

        // Check if email already exists
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        // Create organization
        const orgRows = await sql`
            INSERT INTO organizations (name, type, phone, street, city, state, pincode, country)
            VALUES (${orgName}, ${orgType}, ${orgPhone}, ${street}, ${city}, ${state}, ${pincode}, ${country || "India"})
            RETURNING id
        `;
        const orgId = orgRows[0].id;

        // Hash password and create user
        const passwordHash = await bcrypt.hash(password, 12);
        await sql`
            INSERT INTO users (org_id, full_name, email, password_hash, role)
            VALUES (${orgId}, ${fullName}, ${email}, ${passwordHash}, 'admin')
        `;

        return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
