"use client";

import { useState, useEffect } from "react";
import GroupOfTasks from "@/components/GroupOfTasks";
import {
  ActionIcon,
  Box,
  Center,
  Flex,
  MultiSelect,
  Title,
  TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useCreateStatus } from "@/hooks/useStatuses";
import { useUpdateTask } from "@/hooks/useTask";
import api from "@/lib/api/axiosInstance";
export interface TagProps {
  id: string;
  name: string;
  color: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskProps {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  tags: TagProps[];
}

export interface GroupProps {
  id: string;
  name: string;
  color: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: TaskProps[];
}

export default function Board() {
  const queryClient = useQueryClient();
  const [shownGroups, setShownGroups] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");

  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery<GroupProps[], Error>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await api.get("/api/tasks");
      return res.data;
    },
  } as UseQueryOptions<GroupProps[], Error>);

  useEffect(() => {
    if (groups.length > 0) {
      setShownGroups((prev) => {
        const existingGroups = new Set(prev);
        groups
          .filter((group) => group.tasks && group.tasks.length > 0)
          .forEach((group) => existingGroups.add(group.name));
        return Array.from(existingGroups);
      });
    }
  }, [groups]);

  const addGroup = useCreateStatus();

  const { mutate: updateTaskGroup } = useUpdateTask();

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    setShownGroups((prev) => [...prev, newGroupName.trim()]);
    addGroup.mutate(
      { name: newGroupName.trim() },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: () => {
          setShownGroups((prev) =>
            prev.filter((name) => name !== newGroupName.trim())
          );
        },
      }
    );

    setNewGroupName("");
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log(active);
    console.log(over);
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const taskId = activeId;
    const newGroupId = overId;

    updateTaskGroup({
      id: taskId,
      data: { statusId: newGroupId },
    });
  };

  if (isLoading) return <Center>Loading...</Center>;
  if (error) return <Center>Error loading tasks</Center>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Center w="100vw">
        <Box
          style={{
            width: "98%",
            backgroundColor: "rgba(163, 190, 254, 0.8)",
            padding: "2rem",
            borderRadius: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            style={{
              width: "100%",
              backgroundColor: "lightblue",
              padding: "2rem",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: "10px",
            }}
          >
            <MultiSelect
              style={{ maxWidth: 320 }}
              label="Choose groups to show (empty ones are hidden)"
              data={groups.map((group) => group.name)}
              value={shownGroups}
              onChange={setShownGroups}
            />
          </Box>
          <Flex
            gap="md"
            justify="flex-start"
            align="flex-start"
            direction="row"
          >
            {groups.map((group) =>
              shownGroups.includes(group.name) ? (
                <GroupOfTasks {...group} key={group.id} />
              ) : null
            )}
            <Box
              style={{
                maxWidth: 320,
                backgroundColor: "lightblue",
                padding: "2rem",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Flex gap="sm" align="center" direction="column">
                <Title order={3}>Add new group</Title>
                <TextInput
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.currentTarget.value)}
                  style={{ width: "100%" }}
                />
                <ActionIcon
                  variant="filled"
                  color="blue"
                  onClick={handleAddGroup}
                >
                  <IconPlus color="white" />
                </ActionIcon>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Center>
    </DndContext>
  );
}
