import { GET, PATCH, DELETE } from "../route";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";
import {
  mockUser,
  createRequest,
  expectUnauthorized,
  expectNotFound,
  expectBadRequest,
  expectDatabaseError,
  setupAuthMocks,
  mockUnauthorizedCookies
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  tag: {
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  taskTag: {
    deleteMany: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Tag API", () => {
  const mockTag = {
    id: "tag-1",
    name: "Important",
    color: "#FF0000",
    userId: mockUser.userId,
    isDefault: true
  };

  const nonDefaultTag = {
    ...mockTag,
    isDefault: false
  };

  const validUpdateRequest = {
    name: "Updated Tag",
    color: "#00FF00"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("GET /api/tags/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await GET(createRequest("/api/tags/tag-1", "GET"), {
        params: { id: "tag-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 404 if tag not found", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      const response = await GET(createRequest("/api/tags/tag-1", "GET"), {
        params: { id: "tag-1" }
      });
      await expectNotFound(response, "Tag not found");
    });

    it("should return 404 if user doesn't own the tag", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      const response = await GET(createRequest("/api/tags/tag-1", "GET"), {
        params: { id: "tag-1" }
      });
      await expectNotFound(response, "Tag not found");
    });

    it("should return tag successfully", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(mockTag);
      const response = await GET(createRequest("/api/tags/tag-1", "GET"), {
        params: { id: "tag-1" }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTag);
    });

    it("should return 500 if database error", async () => {
      (prisma.tag.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );
      const response = await GET(createRequest("/api/tags/tag-1", "GET"), {
        params: { id: "tag-1" }
      });
      await expectDatabaseError(response, "Failed to fetch tag");
    });
  });

  describe("PATCH /api/tags/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", validUpdateRequest),
        { params: { id: "tag-1" } }
      );
      await expectUnauthorized(response);
    });

    it("should return 404 if tag not found", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", validUpdateRequest),
        { params: { id: "tag-1" } }
      );
      await expectNotFound(response, "Tag not found");
    });

    it("should return 404 if user doesn't own the tag", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", validUpdateRequest),
        { params: { id: "tag-1" } }
      );
      await expectNotFound(response, "Tag not found");
    });

    it("should return 400 if trying to modify default tag name", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(mockTag);
      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", { name: "New Name" }),
        { params: { id: "tag-1" } }
      );
      await expectBadRequest(response, "Cannot modify name of default tag");
    });

    it("should return 400 if tag with same name exists", async () => {
      (prisma.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(nonDefaultTag)
        .mockResolvedValueOnce({ ...mockTag, id: "different-id" });

      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", { name: "Existing Name" }),
        { params: { id: "tag-1" } }
      );
      await expectBadRequest(response, "Tag with this name already exists");
    });

    it("should update tag successfully", async () => {
      const updatedTag = { ...nonDefaultTag, ...validUpdateRequest };
      (prisma.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(nonDefaultTag)
        .mockResolvedValueOnce(null);
      (prisma.tag.update as jest.Mock).mockResolvedValue(updatedTag);

      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", validUpdateRequest),
        { params: { id: "tag-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedTag);
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: "tag-1" },
        data: validUpdateRequest
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(nonDefaultTag)
        .mockResolvedValueOnce(null);
      (prisma.tag.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await PATCH(
        createRequest("/api/tags/tag-1", "PUT", validUpdateRequest),
        { params: { id: "tag-1" } }
      );
      await expectDatabaseError(response, "Failed to update tag");
    });
  });

  describe("DELETE /api/tags/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await DELETE(
        createRequest("/api/tags/tag-1", "DELETE"),
        { params: { id: "tag-1" } }
      );
      await expectUnauthorized(response);
    });

    it("should return 404 if tag not found", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      const response = await DELETE(
        createRequest("/api/tags/tag-1", "DELETE"),
        { params: { id: "tag-1" } }
      );
      await expectNotFound(response, "Tag not found");
    });

    it("should return 404 if user doesn't own the tag", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(null);
      const response = await DELETE(
        createRequest("/api/tags/tag-1", "DELETE"),
        { params: { id: "tag-1" } }
      );
      await expectNotFound(response, "Tag not found");
    });

    it("should return 400 if trying to delete default tag", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(mockTag);
      const response = await DELETE(
        createRequest("/api/tags/tag-1", "DELETE"),
        { params: { id: "tag-1" } }
      );
      await expectBadRequest(response, "Cannot delete default tag");
    });

    it("should delete tag and its relations successfully", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(nonDefaultTag);

      const response = await DELETE(
        createRequest("/api/tags/tag-1", "DELETE"),
        { params: { id: "tag-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Tag deleted successfully");
      expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({
        where: { tagId: "tag-1" }
      });
      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: "tag-1" }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.tag.findFirst as jest.Mock).mockResolvedValue(nonDefaultTag);
      (prisma.tag.delete as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE(
        createRequest("/api/tags/tag-1", "DELETE"),
        { params: { id: "tag-1" } }
      );
      await expectDatabaseError(response, "Failed to delete tag");
    });
  });
});
