import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

// PUT /api/statuses/[id] - Update a status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
  const { params } = context;
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    const existingStatus = await prisma.status.findUnique({
      where: { id: params.id }
    });

    if (!existingStatus) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    if (existingStatus.userId !== payload.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (name && existingStatus.isDefault) {
      return NextResponse.json(
        { error: "Cannot modify name of default status" },
        { status: 400 }
      );
    }

    if (name) {
      // Check if status with same name already exists for this user
      const existingStatusWithName = await prisma.status.findFirst({
        where: {
          userId: payload.userId,
          name,
          id: { not: params.id }
        }
      });

      if (existingStatusWithName) {
        return NextResponse.json(
          { error: "Status with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedStatus = await prisma.status.update({
      where: { id: params.id },
      data: {
        name: name ?? existingStatus.name,
        color: color ?? existingStatus.color
      }
    });

    return NextResponse.json(updatedStatus);
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

// DELETE /api/statuses/[id] - Delete a status
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
  const { params } = context;
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingStatus = await prisma.status.findUnique({
      where: { id: params.id }
    });

    if (!existingStatus) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    if (existingStatus.userId !== payload.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (existingStatus.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default status" },
        { status: 400 }
      );
    }

    // Check if there are any tasks using this status
    const tasksWithStatus = await prisma.task.findFirst({
      where: { statusId: params.id }
    });

    if (tasksWithStatus) {
      // Find the "To Do" status for this user
      const toDoStatus = await prisma.status.findFirst({
        where: {
          userId: payload.userId,
          name: "To Do"
        }
      });

      if (!toDoStatus) {
        return NextResponse.json(
          { error: "Default 'To Do' status not found" },
          { status: 500 }
        );
      }

      // Update all tasks using this status to use "To Do" status instead
      await prisma.task.updateMany({
        where: { statusId: params.id },
        data: { statusId: toDoStatus.id }
      });
    }

    // Now we can safely delete the status
    await prisma.status.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      {
        message: tasksWithStatus
          ? "Status deleted successfully and tasks reassigned to 'To Do'"
          : "Status deleted successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting status:", error);
    return NextResponse.json(
      { error: "Failed to delete status" },
      { status: 500 }
    );
  }
}
