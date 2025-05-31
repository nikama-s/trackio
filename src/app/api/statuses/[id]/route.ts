import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

// PUT /api/statuses/[id] - Update a status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
export async function DELETE({ params }: { params: { id: string } }) {
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
      return NextResponse.json(
        { error: "Cannot delete status that is in use by tasks" },
        { status: 400 }
      );
    }

    await prisma.status.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: "Status deleted successfully" },
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
