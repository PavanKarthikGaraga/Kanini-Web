import { NextRequest, NextResponse } from "next/server";

const ML_BACKEND = process.env.ML_BACKEND_URL || "http://localhost:8000";

/**
 * GET /api/queue/[department]
 * Get queue for a specific department from ML backend.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ department: string }> }
) {
    const { department } = await params;
    try {
        const mlRes = await fetch(`${ML_BACKEND}/queue/${encodeURIComponent(department)}`);
        if (!mlRes.ok) {
            return NextResponse.json({ error: "ML queue service failed." }, { status: 502 });
        }
        const result = await mlRes.json();
        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/queue/[department]
 * Pop the next patient from a department queue.
 */
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ department: string }> }
) {
    const { department } = await params;
    try {
        const mlRes = await fetch(`${ML_BACKEND}/queue/${encodeURIComponent(department)}/next`, {
            method: "POST",
        });
        if (!mlRes.ok) {
            const errData = await mlRes.json().catch(() => ({}));
            return NextResponse.json({ error: errData.detail || "No patients in queue." }, { status: mlRes.status });
        }
        const result = await mlRes.json();
        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
