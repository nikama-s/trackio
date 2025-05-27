import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    if (refreshToken) {
      await prisma.refreshToken
        .deleteMany({
          where: { token: refreshToken }
        })
        .catch((error) => console.error("Token deletion error:", error));
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
