import { GET, POST } from "../route";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";
import {
  mockUser,
  createRequest,
  expectUnauthorized,
  expectBadRequest,
  expectDatabaseError,
  setupAuthMocks,
  mockUnauthorizedCookies
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  tag: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Tags API", () => {
  const mockTags = [
    {
      id: "tag-1",
      name: "Important",
      color: "#FF0000",
      userId: mockUser.userId,
      isDefault: true
    },
    {
      id: "tag-2",
      name: "Urgent",
      color: "#FFA500",
      userId: mockUser.userId,
      isDefault: false
    }
  ];

  const validRequest = {
    name: "New Tag",
    color: "#00FF00"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("GET /api/tags", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await GET();
      await expectUnauthorized(response);
    });

    it("should return 401 if invalid access token", async () => {
      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await GET();
      await expectUnauthorized(response);
    });

    it("should return all tags for the user", async () => {
      (prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.userId }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.tag.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      await expectDatabaseError(response, "Failed to fetch tags");
    });
  });

  describe("POST /api/tags", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await POST(
        createRequest("/api/tags", "POST", validRequest)
      );
      await expectUnauthorized(response);
    });

    it("should return 400 if name is missing", async () => {
      const response = await POST(
        createRequest("/api/tags", "POST", { color: "#FF0000" })
      );
      await expectBadRequest(response, "Name is required");
    });

    it("should return 400 if tag with same name exists", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(mockTags[0]);

      const response = await POST(
        createRequest("/api/tags", "POST", validRequest)
      );
      await expectBadRequest(response, "Tag with this name already exists");
    });

    it("should create a new tag successfully", async () => {
      const newTag = {
        ...validRequest,
        id: "new-tag-id",
        userId: mockUser.userId,
        isDefault: false
      };

      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.tag.create as jest.Mock).mockResolvedValue(newTag);

      const response = await POST(
        createRequest("/api/tags", "POST", validRequest)
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newTag);
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          ...validRequest,
          userId: mockUser.userId
        }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.tag.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await POST(
        createRequest("/api/tags", "POST", validRequest)
      );
      await expectDatabaseError(response, "Failed to create tag");
    });
  });
});
