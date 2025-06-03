"use client";

import {
  Card,
  Stack,
  Divider,
  Text,
  Alert,
  Container,
  Button
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTask, useUpdateTask } from "@/hooks/useTask";
import {
  TaskSkeleton,
  TaskHeader,
  TaskStatusAndDeadline
} from "@/components/task";
import { TagEditModal, StatusManagementModal } from "@/components/modals";
import { use, useCallback, useMemo, useState } from "react";
import { useStatuses } from "@/hooks/useStatuses";
import { AutoResizingTextarea } from "@/components/AutoResizingTextArea";
import { useRouter } from "next/navigation";

export default function TaskPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: task, isLoading, error } = useTask(id);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const router = useRouter();
  const updateTask = useUpdateTask();
  const { data: statuses } = useStatuses();

  const formattedDates = useMemo(() => {
    if (!task) return null;
    return {
      createdAt: dayjs(task.createdAt).format("DD.MM.YYYY HH:mm"),
      updatedAt: dayjs(task.updatedAt).format("DD.MM.YYYY HH:mm"),
      deadline: task.deadline
        ? dayjs(task.deadline).format("DD.MM.YYYY HH:mm")
        : null
    };
  }, [task]);

  const handleDeadlineChange = useCallback(
    (date: string | null) => {
      updateTask.mutate({
        id: id,
        data: {
          deadline: date
        }
      });
    },
    [id, updateTask]
  );

  const handleStatusChange = useCallback(
    (statusId: string | null) => {
      if (statusId) {
        updateTask.mutate({
          id: id,
          data: {
            statusId: statusId
          }
        });
      }
    },
    [id, updateTask]
  );

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
        my="xl"
      >
        <Alert color="red" title="Error">
          {error instanceof Error ? error.message : "Failed to load task"}
        </Alert>
      </Card>
    );
  }

  if (!task || !statuses) {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        maw={600}
        mx="auto"
        my="xl"
      >
        <Alert color="yellow" title="Not Found">
          Task not found
        </Alert>
      </Card>
    );
  }

  const updateField = (field: keyof typeof task, value: string) => {
    updateTask.mutate({
      id: id,
      data: {
        [field]: value
      }
    });
  };

  return (
    <Container className="w-full h-full">
      <Button
        size="sm"
        mb="md"
        onClick={() => router.push("/board")}
        leftSection={<IconArrowLeft size={16} />}
        style={{ position: "absolute", left: 20, top: 20, zIndex: 10 }}
      >
        Go Back
      </Button>

      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        mt="3rem"
        maw={700}
        mx="auto"
        style={{ margin: 0 }}
      >
        <Stack>
          <TaskHeader
            title={task.title}
            tags={task.tags}
            onTitleChange={(value) => updateField("title", value)}
            onEditTags={() => setIsAddTagModalOpen(true)}
          />

          <Text size="sm" c="dimmed">
            Created: {formattedDates?.createdAt} • Last updated:{" "}
            {formattedDates?.updatedAt}
          </Text>

          <Divider />

          <AutoResizingTextarea
            initialValue={task.description || ""}
            onBlurSubmit={(value) => updateField("description", value)}
            placeholder="Add a detailed description..."
          />

          <Divider />

          <TaskStatusAndDeadline
            deadline={task.deadline}
            statusId={task.statusId}
            statuses={statuses}
            onDeadlineChange={handleDeadlineChange}
            onStatusChange={handleStatusChange}
            onManageStatuses={() => setIsStatusModalOpen(true)}
          />
        </Stack>
      </Card>
      <TagEditModal
        opened={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        taskId={task.id}
        currentTags={task.tags}
      />

      <StatusManagementModal
        opened={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </Container>
  );
}
