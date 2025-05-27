import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { AccessTokenPayload, RefreshTokenPayload } from "./types";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const deleteUserRefreshTokens = async (userId: string) => {
  return prisma.refreshToken.deleteMany({
    where: { userId }
  });
};

export const saveRefreshToken = async (userId: string, token: string) => {
  await deleteUserRefreshTokens(userId);

  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });
};

function isAccessTokenPayload(
  payload: string | JwtPayload
): payload is AccessTokenPayload {
  return (
    typeof payload !== "string" && "userId" in payload && "email" in payload
  );
}

function isRefreshTokenPayload(
  payload: string | JwtPayload
): payload is RefreshTokenPayload {
  return typeof payload !== "string" && "userId" in payload;
}

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, JWT_SECRET);

  if (!isAccessTokenPayload(payload)) {
    throw new Error("Invalid access token structure");
  }

  return payload;
};

export const verifyRefreshToken = async (token: string) => {
  const payload = jwt.verify(token, JWT_SECRET);

  if (!isRefreshTokenPayload(payload)) {
    throw new Error("Invalid refresh token structure");
  }

  const dbToken = await prisma.refreshToken.findFirst({
    where: {
      token,
      userId: payload.userId,
      expiresAt: { gt: new Date() }
    }
  });

  if (!dbToken) {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lte: new Date() } }
    });
    throw new Error("Invalid or expired refresh token");
  }

  return payload;
};

export const revokeRefreshToken = async (token: string) => {
  return prisma.refreshToken.deleteMany({
    where: { token }
  });
};
