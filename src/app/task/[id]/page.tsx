"use client";

import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Divider,
  Text,
  Flex,
  Alert,
  Popover,
  Button,
  Select,
  Container
} from "@mantine/core";
import {
  IconCalendar,
  IconEdit,
  IconX,
  IconChevronDown,
  IconArrowLeft
} from "@tabler/icons-react";
import dayjs from "dayjs";
import EditableText from "@/components/EditableText";
import { useTask, useUpdateTask } from "@/hooks/useTask";
import Tag from "@/components/Tag";
import TaskSkeleton from "@/components/TaskSkeleton";
import TagEditModal from "@/components/TagEditModal";
import StatusManagementModal from "@/components/StatusManagementModal";
import { use, useCallback, useMemo } from "react";
import { useState } from "react";
import { DatePicker } from "@mantine/dates";
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
  const [deadlinePopoverOpen, setDeadlinePopoverOpen] = useState(false);
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
    (dateString: string | null) => {
      updateTask.mutate({
        id: id,
        data: {
          deadline: dateString
        }
      });
      setDeadlinePopoverOpen(false);
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

  if (!task) {
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
    <>
      <Container size="sm" py="xl" style={{ minHeight: "100vh" }}>
        <Button
          variant="light"
          size="sm"
          mb="md"
          onClick={() => router.push("/board")}
          leftSection={<IconArrowLeft size={16} />}
          style={{ position: "absolute", left: 20, top: 20 }}
        >
          Go Back
        </Button>

        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          maw={700}
          mx="auto"
          my="xl"
          style={{ marginTop: "4rem" }}
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

            <Group justify="space-between">
              <Group gap={1}>
                <Text fw={500}>Deadline:</Text>
                <Popover
                  opened={deadlinePopoverOpen}
                  onChange={setDeadlinePopoverOpen}
                  position="bottom"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Button
                      variant="subtle"
                      rightSection={<IconCalendar size={16} />}
                      onClick={() => setDeadlinePopoverOpen((o) => !o)}
                    >
                      {task.deadline
                        ? dayjs(task.deadline).format("DD.MM.YYYY HH:mm")
                        : "No deadline"}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Stack>
                      <DatePicker
                        value={task.deadline ? new Date(task.deadline) : null}
                        onChange={(date) => handleDeadlineChange(date)}
                      />
                      {task.deadline && (
                        <Button
                          variant="outline"
                          color="red"
                          onClick={() => {
                            handleDeadlineChange(null);
                            setDeadlinePopoverOpen(false);
                          }}
                          leftSection={<IconX size={16} />}
                        >
                          Clear deadline
                        </Button>
                      )}
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Group>

              <Group gap={1}>
                <Select
                  placeholder="Select status"
                  value={task.statusId || null}
                  onChange={handleStatusChange}
                  className="w-[150px]"
                  data={
                    statuses?.map((status) => ({
                      value: status.id,
                      label: status.name,
                      color: status.color
                    })) || []
                  }
                  rightSection={<IconChevronDown size={16} />}
                  styles={{
                    input: {
                      border: "none",
                      paddingRight: "2rem",
                      display: "flex",
                      alignItems: "center"
                    }
                  }}
                  leftSection={
                    task.statusId ? (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor:
                            statuses?.find((s) => s.id === task.statusId)
                              ?.color || "gray"
                        }}
                      />
                    ) : null
                  }
                />
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  Manage
                </Button>
              </Group>
            </Group>
          </Stack>
        </Card>
      </Container>

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
    </>
  );
}
