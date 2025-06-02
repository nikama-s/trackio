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
  mockUnauthorizedCookies,
  setupAuthMocks
} from "@/test/utils/api-test-utils";

// Mock setup
jest.mock("@/lib/prisma", () => ({
  status: {
    findMany: jest.fn(),
    findFirst: jest.fn()
  },
  task: {
    create: jest.fn()
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

describe("Tasks API", () => {
  const mockStatuses = [
    {
      id: "status-1",
      name: "To Do",
      color: "#000000",
      userId: mockUser.userId,
      tasks: [
        {
          id: "task-1",
          title: "Test Task",
          description: "Test Description",
          deadline: new Date("2025-06-01T15:02:31.888Z").toISOString(),
          createdAt: new Date("2025-06-01T15:02:31.888Z").toISOString(),
          updatedAt: new Date("2025-06-01T15:02:31.888Z").toISOString(),
          taskTags: [
            {
              tag: {
                id: "tag-1",
                name: "Important",
                color: "#FF0000"
              }
            }
          ]
        }
      ]
    }
  ];

  const validRequest = {
    title: "New Task",
    description: "New Description",
    statusId: "status-1",
    deadline: new Date().toISOString(),
    tagIds: ["tag-1"]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks(verifyAccessToken as jest.Mock, cookies as jest.Mock);
  });

  describe("GET /api/tasks", () => {
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

    it("should return all tasks grouped by status", async () => {
      (prisma.status.findMany as jest.Mock).mockResolvedValue(mockStatuses);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(
        mockStatuses.map((status) => ({
          id: status.id,
          name: status.name,
          color: status.color,
          tasks: status.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            tags: task.taskTags.map((taskTag) => ({
              id: taskTag.tag.id,
              name: taskTag.tag.name,
              color: taskTag.tag.color
            })),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }))
        }))
      );
    });

    it("should return 500 if database error", async () => {
      (prisma.status.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      await expectDatabaseError(response, "Failed to fetch tasks");
    });
  });

  describe("POST /api/tasks", () => {
    it("should return 401 if no access token", async () => {
      mockUnauthorizedCookies(cookies as jest.Mock);
      const response = await POST(
        createRequest("/api/tasks", "POST", validRequest)
      );
      await expectUnauthorized(response);
    });

    it("should return 400 if title is missing", async () => {
      const response = await POST(
        createRequest("/api/tasks", "POST", {
          description: "Test",
          statusId: "status-1"
        })
      );
      await expectBadRequest(response, "Title is required");
    });

    it("should return 400 if statusId is missing", async () => {
      const response = await POST(
        createRequest("/api/tasks", "POST", {
          title: "Test",
          description: "Test"
        })
      );
      await expectBadRequest(response, "Status ID is required");
    });

    it("should return 400 if status not found", async () => {
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await POST(
        createRequest("/api/tasks", "POST", validRequest)
      );
      await expectBadRequest(response, "Status not found");
    });

    it("should return 400 if one or more tags not found", async () => {
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(mockStatuses[0]);
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([]);

      const response = await POST(
        createRequest("/api/tasks", "POST", validRequest)
      );
      await expectBadRequest(response, "One or more tags not found");
    });

    it("should create a new task successfully", async () => {
      const newTask = {
        id: "new-task-id",
        ...validRequest,
        userId: mockUser.userId,
        createdAt: new Date("2025-06-01T15:02:32.271Z").toISOString(),
        updatedAt: new Date("2025-06-01T15:02:32.271Z").toISOString(),
        status: {
          ...mockStatuses[0],
          tasks: mockStatuses[0].tasks.map((task) => ({
            ...task,
            deadline: task.deadline,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }))
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

      (prisma.status.findFirst as jest.Mock).mockResolvedValue(mockStatuses[0]);
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: "tag-1", name: "Important", color: "#FF0000" }
      ]);
      (prisma.task.create as jest.Mock).mockResolvedValue(newTask);

      const response = await POST(
        createRequest("/api/tasks", "POST", validRequest)
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: validRequest.title,
          description: validRequest.description,
          statusId: validRequest.statusId,
          deadline: new Date(validRequest.deadline),
          userId: mockUser.userId,
          taskTags: {
            create: validRequest.tagIds.map((tagId) => ({
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

    it("should return 500 if database error", async () => {
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(mockStatuses[0]);
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: "tag-1", name: "Important", color: "#FF0000" }
      ]);
      (prisma.task.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await POST(
        createRequest("/api/tasks", "POST", validRequest)
      );
      await expectDatabaseError(response, "Failed to create task");
    });
  });
});
