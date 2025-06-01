import prisma from "@/lib/prisma";

const DEFAULT_STATUSES = [
  {
    name: "Backlog",
    color: "#808080",
    isDefault: true
  },
  {
    name: "To Do",
    color: "#0AFAEE",
    isDefault: true
  },
  {
    name: "In Progress",
    color: "#EDEA40",
    isDefault: true
  },
  {
    name: "In Review",
    color: "#9370DB",
    isDefault: true
  },
  {
    name: "Done",
    color: "#32CD32",
    isDefault: true
  }
];

export async function createDefaultStatuses(userId: string) {
  const statuses = await Promise.all(
    DEFAULT_STATUSES.map((status) =>
      prisma.status.create({
        data: {
          ...status,
          userId
        }
      })
    )
  );

  return statuses;
}
