import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyAccessTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || !payload.email) {
      throw new Error("Invalid access token structure");
    }

    return payload as { userId: string; email: string };
  } catch {
    throw new Error("Invalid access token");
  }
}

export async function verifyRefreshTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId) {
      throw new Error("Invalid refresh token structure");
    }

    return payload as { userId: string };
  } catch {
    throw new Error("Invalid refresh token");
  }
}
