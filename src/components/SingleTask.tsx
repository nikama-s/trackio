"use client";
import Link from "next/link";

import { TaskProps } from "@/app/board/page";
import Tag from "./Tag";
import { Box, Flex, Text } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function SingleTask(task: TaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id || "default-id",
      data: {
        type: "task",
      },
    });

  function handleTaskChoose() {
    if (typeof window !== "undefined") {
      localStorage.setItem("chosenProduct", JSON.stringify(task));
    }
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} mb="md">
      <Box
        style={{
          minWidth: 350,
          backgroundColor: "white",
          padding: "2rem",
          paddingTop: "1rem",
          borderRadius: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <Box
          {...listeners}
          {...attributes}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            cursor: "grab",
            padding: "5px",
          }}
        >
          ☰
        </Box>
        <Link
          href="/task"
          onClick={handleTaskChoose}
          style={{ textDecoration: "none" }}
        >
          <Flex
            gap="xs"
            justify="flex-start"
            align="flex-start"
            direction="row"
          >
            {task.tags.map((tag) => (
              <Tag {...tag} key={tag.id} />
            ))}
          </Flex>
          <Text mt="sm">{task.title}</Text>
          <Text mt="md" size="sm">
            Due to: {task.deadline}
          </Text>
        </Link>
      </Box>
    </Box>
  );
}
