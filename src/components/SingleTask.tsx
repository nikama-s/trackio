import { TaskProps } from "@/app/board/page";
import Tag from "./Tag";
import { Box, Flex, Text } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function SingleTask({ id, title, tags, deadline }: TaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        type: "task",
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <Box ref={setNodeRef} style={style} {...listeners} {...attributes} mb="md">
      <Box
        style={{
          minWidth: 350,
          backgroundColor: "white",
          padding: "2rem",
          paddingTop: "1rem",
          borderRadius: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Flex gap="xs" justify="flex-start" align="flex-start" direction="row">
          {tags.map((tag) => (
            <Tag {...tag} key={tag.id} />
          ))}
        </Flex>
        <Text mt="sm">{title}</Text>
        <Text mt="md" size="sm">
          Due to: {deadline}
        </Text>
      </Box>
    </Box>
  );
}
