"use client";

import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Divider,
  Text,
  Flex,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import dayjs from "dayjs";
import EditableText from "@/components/EditableText";
import { useState } from "react";
import Tag from "@/components/Tag";

const initialTask = {
  id: "task1",
  title: "Do laundry",
  description: "Use lavender detergent",
  deadline: "2025-06-05T14:00:00Z",
  createdAt: "2025-05-30T10:00:00Z",
  updatedAt: "2025-05-30T10:00:00Z",
  tags: [
    {
      id: "tag1",
      name: "urgent",
      color: "red",
      createdAt: "2025-05-30T09:00:00Z",
      updatedAt: "2025-05-30T09:00:00Z",
    },
    {
      id: "tag2",
      name: "mamas task",
      color: "yellow",
      createdAt: "2025-05-30T09:00:00Z",
      updatedAt: "2025-05-30T09:00:00Z",
    },
  ],
};

export default function TaskPage() {
  const [task, setTask] = useState(initialTask);

  const updateField = (field: keyof typeof task, value: string) => {
    setTask((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      maw={600}
      mx="auto"
      mt="xl"
    >
      <Stack>
        <Group justify="space-between">
          <EditableText
            initialValue={task.title}
            onSubmit={(value) => updateField("title", value)}
          />
          <Group gap="xs">
            {task.tags.map((tag) => (
              <Tag {...tag} key={tag.id} />
            ))}
            <Flex align="center" direction="row" wrap="nowrap">
              <ActionIcon variant="transparent" size="sm">
                <IconPlus color="black"></IconPlus>
              </ActionIcon>
              <Text size="sm">Add new tag</Text>
            </Flex>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          Created: {dayjs(task.createdAt).format("DD.MM.YYYY HH:mm")} • Last
          updated: {dayjs(task.updatedAt).format("DD.MM.YYYY HH:mm")}
        </Text>

        <Divider />

        <EditableText
          initialValue={task.description}
          onSubmit={(value) => updateField("description", value)}
        />

        <Divider />

        <Group justify="space-between">
          <Text fw={500}>Deadline:</Text>
          <EditableText
            initialValue={dayjs(task.deadline).format("DD.MM.YYYY HH:mm")}
            onSubmit={(value) => {
              const parsed = dayjs(value, "DD.MM.YYYY HH:mm");
              if (parsed.isValid()) {
                updateField("deadline", parsed.toISOString());
              }
            }}
          />
        </Group>
      </Stack>
    </Card>
  );
}
