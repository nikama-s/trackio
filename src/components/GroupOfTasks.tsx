"use client";

import { GroupProps, TagProps } from "@/app/(protected)/page";
import SingleTask from "./SingleTask";
import {
  ActionIcon,
  Box,
  Flex,
  Title,
  TextInput,
  Drawer,
  Textarea,
  Text,
  Button,
  Select,
  MultiSelect,
  Loader,
  Group
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDroppable } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { TagManagementModal, StatusManagementModal } from "@/components/modals";

export default function GroupOfTasks({ name, tasks, id }: GroupProps) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(id);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { data: statuses, isLoading: loadingStatuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => {
      const res = await fetch("/api/statuses");
      if (!res.ok) throw new Error("Failed to fetch statuses");
      return res.json();
    }
  });

  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    }
  });

  const { mutate: addTask, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          statusId: selectedStatus,
          description,
          deadline,
          tagIds: selectedTags
        })
      });
      if (!res.ok) throw new Error("Failed to add task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setNewTaskTitle("");
      setDescription("");
      setDeadline("");
      setSelectedTags([]);
      setSelectedStatus(id);
      close();
    }
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask();
  };

  const style = {
    backgroundColor: isOver ? "lightgreen" : "lightblue"
  };

  return (
    <Box
      ref={setNodeRef}
      style={{
        maxWidth: 370,
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        ...style
      }}
    >
      <Drawer opened={opened} onClose={close} title="New task" size="md">
        <Flex direction="column" gap="sm">
          <TextInput
            label="Title"
            placeholder="Enter task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
          />
          <Textarea
            label="Description"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <TextInput
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.currentTarget.value)}
          />

          {loadingStatuses ? (
            <Loader size="sm" />
          ) : (
            <Group gap={1}>
              <Select
                data={
                  statuses?.map((status: GroupProps) => ({
                    value: status.id,
                    label: status.name
                  })) || []
                }
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select group"
              />
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
              >
                Manage
              </Button>
            </Group>
          )}

          {loadingTags ? (
            <Loader size="sm" />
          ) : (
            <Group gap={1}>
              <MultiSelect
                data={
                  tags?.map((tag: TagProps) => ({
                    value: tag.id,
                    label: tag.name
                  })) || []
                }
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder="Select tags"
                searchable
              />
              <Button variant="default" onClick={() => setIsTagModalOpen(true)}>
                Manage
              </Button>
            </Group>
          )}

          <Button onClick={handleAddTask} loading={isPending} mt="md">
            Create Task
          </Button>
        </Flex>
      </Drawer>
      <TagManagementModal
        opened={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />

      <StatusManagementModal
        opened={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

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
          <SingleTask {...task} key={task.id} />
        ))}
      </Flex>

      <Flex align="center" direction="row" wrap="nowrap" mt="md">
        <ActionIcon
          variant="transparent"
          size="md"
          onClick={open}
          disabled={isPending}
        >
          <IconPlus color="black" />
        </ActionIcon>
        <Text>Add task</Text>
      </Flex>
    </Box>
  );
}
