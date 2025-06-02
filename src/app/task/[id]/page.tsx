"use client";

import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Divider,
  Text,
  Flex,
  Alert
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import dayjs from "dayjs";
import EditableText from "@/components/EditableText";
import { useTask, useUpdateTask } from "@/hooks/useTask";
import Tag from "@/components/Tag";
import TaskSkeleton from "@/components/TaskSkeleton";
import TagManagementModal from "@/components/TagManagementModal";
import { use } from "react";
import { useState } from "react";

export default function TaskPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: task, isLoading, error } = useTask(id);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const updateTask = useUpdateTask();

  if (isLoading) {
    return <TaskSkeleton />;
  }

  if (error) {
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
        <Alert color="red" title="Error">
          {error instanceof Error ? error.message : "Failed to load task"}
        </Alert>
      </Card>
    );
  }

  if (!task) {
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
        <Alert color="yellow" title="Not Found">
          Task not found
        </Alert>
      </Card>
    );
  }

  const updateField = (field: keyof typeof task, value: string) => {
    updateTask.mutate({
      id: task.id,
      data: {
        [field]: value
      }
    });
  };

  return (
    <>
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
              <Flex
                align="center"
                direction="row"
                wrap="nowrap"
                style={{ cursor: "pointer" }}
                onClick={() => setIsAddTagModalOpen(true)}
              >
                <ActionIcon variant="transparent" size="sm">
                  <IconEdit color="black" />
                </ActionIcon>
                <Text size="sm">Edit Tags</Text>
              </Flex>
            </Group>
          </Group>

          <Text size="sm" c="dimmed">
            Created: {dayjs(task.createdAt).format("DD.MM.YYYY HH:mm")} • Last
            updated: {dayjs(task.updatedAt).format("DD.MM.YYYY HH:mm")}
          </Text>

          <Divider />

          <EditableText
            initialValue={task.description || ""}
            onSubmit={(value) => updateField("description", value)}
          />

          <Divider />

          <Group justify="space-between">
            <Text fw={500}>Deadline:</Text>
            <EditableText
              initialValue={
                task.deadline
                  ? dayjs(task.deadline).format("DD.MM.YYYY HH:mm")
                  : ""
              }
              onSubmit={(value) => {
                const parsed = dayjs(value, "DD.MM.YYYY HH:mm");
                if (parsed.isValid()) {
                  updateTask.mutate({
                    id: task.id,
                    data: {
                      deadline: parsed.toISOString()
                    }
                  });
                }
              }}
            />
          </Group>
        </Stack>
      </Card>

      <TagManagementModal
        opened={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        taskId={task.id}
        currentTags={task.tags}
      />
    </>
  );
}
