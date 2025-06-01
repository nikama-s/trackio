import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken
} from "@/lib/auth/tokens";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createDefaultStatuses } from "@/lib/status/default-statuses";
import { createDefaultTags } from "@/lib/tags/default-tags";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword
        }
      });

      await Promise.all([
        createDefaultStatuses(newUser.id),
        createDefaultTags(newUser.id)
      ]);

      return [newUser];
    });

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken);

    const response = NextResponse.json(
      { user: { email: user.email, id: user.id } },
      { status: 201 }
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
