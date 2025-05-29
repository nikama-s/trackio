import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  deleteRefreshToken
} from "@/lib/auth/tokens";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await deleteRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, newRefreshToken);

    const response = NextResponse.json(
      { user: { email: user.email, id: user.id } },
      { status: 200 }
    );

    return setAuthCookies(response, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
