import prisma from "@/lib/prisma";

const DEFAULT_TAGS = [
  {
    name: "Bug",
    color: "#FF0000",
    isDefault: true
  },
  {
    name: "Feature",
    color: "#00FF00",
    isDefault: true
  },
  {
    name: "Enhancement",
    color: "#45CFF5",
    isDefault: true
  },
  {
    name: "Documentation",
    color: "#FFA500",
    isDefault: true
  },
  {
    name: "Urgent",
    color: "#FF00FF",
    isDefault: true
  }
];

export async function createDefaultTags(userId: string) {
  const tags = await Promise.all(
    DEFAULT_TAGS.map((tag) =>
      prisma.tag.create({
        data: {
          ...tag,
          userId
        }
      })
    )
  );

  return tags;
}
