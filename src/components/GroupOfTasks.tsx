import { GroupProps } from "@/app/board/page";
import SingleTask from "./SingleTask";
import { ActionIcon, Box, Flex, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDroppable } from "@dnd-kit/core";

export default function GroupOfTasks({ name, tasks, id }: GroupProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : "lightblue",
  };

  return (
    <Box
      ref={setNodeRef}
      style={{
        maxWidth: 370,
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        ...style,
      }}
    >
      <Flex gap="md" justify="space-between">
        <Title order={2} mb="xl">
          {name}
        </Title>
        <Title order={2}>|</Title>
        <Title order={2} mb="xl">
          {tasks.length} tasks
        </Title>
      </Flex>

      <Flex gap="md" justify="center" align="center" direction="column">
        {tasks.map((task) => (
          <SingleTask {...task} key={task.id}></SingleTask>
        ))}
      </Flex>
      <Flex mt="md" align="center" direction="row" wrap="nowrap">
        <ActionIcon variant="transparent" size="sm">
          <IconPlus color="black"></IconPlus>
        </ActionIcon>
        <Text size="sm">Add new task</Text>
      </Flex>
    </Box>
  );
}
