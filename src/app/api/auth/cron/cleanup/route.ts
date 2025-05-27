import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const vercelSignature = request.headers.get("x-vercel-signature");

  const authHeader = request.headers.get("authorization");
  const isValidManualRequest =
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!vercelSignature && !isValidManualRequest) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { count } = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lte: new Date() } }
    });

    return NextResponse.json({
      message: `Cleaned up ${count} expired tokens`,
      success: true
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", success: false },
      { status: 500 }
    );
  }
}
