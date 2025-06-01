import { GET, PUT, DELETE } from "../route";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { cookies } from "next/headers";
import {
  mockUser,
  createRequest,
  expectUnauthorized,
  expectNotFound,
  expectForbidden,
  expectDatabaseError,
  mockUnauthorizedCookies,
  setupAuthMocks,
  expectBadRequest
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  task: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  taskTag: {
    deleteMany: jest.fn()
  },
  status: {
    findFirst: jest.fn()
  },
  tag: {
    findMany: jest.fn()
  }
}));

jest.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

describe("Task ID API", () => {
  const mockTask = {
    id: "task-1",
    title: "Test Task",
    description: "Test Description",
    deadline: new Date("2025-06-01T15:02:31.888Z").toISOString(),
    createdAt: new Date("2025-06-01T15:02:31.888Z").toISOString(),
    updatedAt: new Date("2025-06-01T15:02:31.888Z").toISOString(),
    userId: mockUser.userId,
    statusId: "status-1",
    status: {
      id: "status-1",
      name: "To Do",
      color: "#000000"
    },
    taskTags: [
      {
        tag: {
          id: "tag-1",
          name: "Important",
          color: "#FF0000"
        }
      }
    ]
  };

  const updateRequest = {
    title: "Updated Task",
    description: "Updated Description",
    statusId: "status-2",
    deadline: new Date("2025-06-02T15:02:31.888Z").toISOString(),
    tagIds: ["tag-1", "tag-2"]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("GET /api/tasks/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 401 if invalid access token", async () => {
      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 404 if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET(new Request("http://localhost"), {
        params: { id: "non-existent" }
      });
      await expectNotFound(response, "Task not found");
    });

    it("should return 403 if task belongs to another user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        userId: "other-user-id"
      });

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectForbidden(response);
    });

    it("should return task if found and belongs to user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockTask,
        tags: mockTask.taskTags.map((taskTag) => ({
          id: taskTag.tag.id,
          name: taskTag.tag.name,
          color: taskTag.tag.color
        }))
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.task.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectDatabaseError(response, "Failed to fetch task");
    });
  });

  describe("PUT /api/tasks/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectUnauthorized(response);
    });

    it("should return 404 if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectNotFound(response, "Task not found");
    });

    it("should return 403 if task belongs to another user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        userId: "other-user-id"
      });

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectForbidden(response);
    });

    it("should return 400 if status not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectBadRequest(response, "Status not found");
    });

    it("should return 400 if one or more tags not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.status.findFirst as jest.Mock).mockResolvedValue({
        id: "status-2"
      });
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: "tag-1", name: "Tag 1" }
      ]);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectBadRequest(response, "One or more tags not found");
    });

    it("should update task with tags successfully", async () => {
      const updatedTask = {
        ...mockTask,
        ...updateRequest,
        updatedAt: new Date("2025-06-02T15:02:31.888Z").toISOString(),
        taskTags: [
          {
            tag: {
              id: "tag-1",
              name: "Tag 1",
              color: "#FF0000"
            }
          },
          {
            tag: {
              id: "tag-2",
              name: "Tag 2",
              color: "#00FF00"
            }
          }
        ]
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.status.findFirst as jest.Mock).mockResolvedValue({
        id: "status-2"
      });
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: "tag-1", name: "Tag 1", color: "#FF0000" },
        { id: "tag-2", name: "Tag 2", color: "#00FF00" }
      ]);
      (prisma.taskTag.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedTask);
      expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({
        where: { taskId: "task-1" }
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: {
          title: updateRequest.title,
          description: updateRequest.description,
          statusId: updateRequest.statusId,
          deadline: new Date(updateRequest.deadline),
          taskTags: {
            create: updateRequest.tagIds.map((tagId) => ({
              tag: {
                connect: {
                  id: tagId
                }
              }
            }))
          }
        },
        include: {
          status: true,
          taskTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it("should update task without tags successfully", async () => {
      const updateRequestWithoutTags = {
        ...updateRequest,
        tagIds: undefined
      };
      const updatedTask = {
        ...mockTask,
        ...updateRequestWithoutTags,
        updatedAt: new Date("2025-06-02T15:02:31.888Z").toISOString(),
        taskTags: []
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.status.findFirst as jest.Mock).mockResolvedValue({
        id: "status-2"
      });
      (prisma.taskTag.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequestWithoutTags),
        { params: { id: "task-1" } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedTask);
      expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({
        where: { taskId: "task-1" }
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: {
          title: updateRequestWithoutTags.title,
          description: updateRequestWithoutTags.description,
          statusId: updateRequestWithoutTags.statusId,
          deadline: new Date(updateRequestWithoutTags.deadline),
          taskTags: {
            create: []
          }
        },
        include: {
          status: true,
          taskTags: {
            include: {
              tag: true
            }
          }
        }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.status.findFirst as jest.Mock).mockResolvedValue({
        id: "status-2"
      });
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: "tag-1", name: "Tag 1" },
        { id: "tag-2", name: "Tag 2" }
      ]);
      (prisma.task.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await PUT(
        createRequest("/api/tasks/task-1", "PUT", updateRequest),
        { params: { id: "task-1" } }
      );
      await expectDatabaseError(response, "Failed to update task");
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectUnauthorized(response);
    });

    it("should return 404 if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectNotFound(response, "Task not found");
    });

    it("should return 403 if task belongs to another user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        ...mockTask,
        userId: "other-user-id"
      });

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectForbidden(response);
    });

    it("should delete task if found and belongs to user", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.taskTag.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockTask);

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: "Task deleted successfully" });
      expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({
        where: { taskId: "task-1" }
      });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" }
      });
    });

    it("should return 500 if database error", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.taskTag.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE(new Request("http://localhost"), {
        params: { id: "task-1" }
      });
      await expectDatabaseError(response, "Failed to delete task");
    });
  });
});
