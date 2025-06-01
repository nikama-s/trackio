import type { NextResponse } from "next/server";

// Common test data
export const mockUser = {
  userId: "test-user-id",
  id: "test-user-id",
  email: "test@example.com",
  password: "hashed-password"
};

// Request creation helpers
export const createRequest = <T extends Record<string, unknown>>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: T
) =>
  new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) })
  });

// Response assertion helpers
export const expectUnauthorized = async (response: NextResponse) => {
  const data = await response.json();
  expect(response.status).toBe(401);
  expect(data.error).toBe("Unauthorized");
};

export const expectNotFound = async (
  response: NextResponse,
  message: string
) => {
  const data = await response.json();
  expect(response.status).toBe(404);
  expect(data.error).toBe(message);
};

export const expectForbidden = async (response: NextResponse) => {
  const data = await response.json();
  expect(response.status).toBe(403);
  expect(data.error).toBe("Access denied");
};

export const expectBadRequest = async (
  response: NextResponse,
  message: string
) => {
  const data = await response.json();
  expect(response.status).toBe(400);
  expect(data.error).toBe(message);
};

export const expectDatabaseError = async (
  response: NextResponse,
  message: string
) => {
  const data = await response.json();
  expect(response.status).toBe(500);
  expect(data.error).toBe(message);
};

// Mock setup helpers
export const setupAuthMocks = (
  verifyAccessToken: jest.Mock,
  cookies: jest.Mock
) => {
  verifyAccessToken.mockReturnValue(mockUser);
  cookies.mockReturnValue({
    get: jest.fn().mockImplementation((name) => {
      if (name === "accessToken") {
        return { value: "mock-access-token" };
      }
      return null;
    })
  });
};

export const mockUnauthorizedCookies = (cookies: jest.Mock) => {
  cookies.mockReturnValueOnce({
    get: jest.fn().mockReturnValue(null)
  });
};
