"use client";
const mockInfo = [
  {
    id: "status1",
    name: "To Do",
    tasks: [
      {
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
      },
      {
        id: "task2",
        title: "Buy groceries",
        description: "Milk, bread, eggs, apples",
        deadline: "2025-06-01T16:00:00Z",
        createdAt: "2025-05-30T10:05:00Z",
        updatedAt: "2025-05-30T10:05:00Z",
        tags: [],
      },
      {
        id: "task3",
        title: "Walk the dog",
        description: "Evening walk in the park",
        deadline: "2025-06-01T19:00:00Z",
        createdAt: "2025-05-30T11:00:00Z",
        updatedAt: "2025-05-30T11:00:00Z",
        tags: [],
      },
      {
        id: "task4",
        title: "Write blog post",
        description: "Topic: Productivity tips",
        deadline: "2025-06-04T15:00:00Z",
        createdAt: "2025-05-25T10:00:00Z",
        updatedAt: "2025-05-25T10:00:00Z",
        tags: [
          {
            id: "tag1",
            name: "urgent",
            color: "red",
            createdAt: "2025-05-30T09:00:00Z",
            updatedAt: "2025-05-30T09:00:00Z",
          },
        ],
      },
      {
        id: "task5",
        title: "Call mom",
        description: "Check in and chat",
        deadline: "2025-06-01T18:00:00Z",
        createdAt: "2025-05-30T12:00:00Z",
        updatedAt: "2025-05-30T12:00:00Z",
        tags: [],
      },
      {
        id: "task6",
        title: "Backup photos",
        description: "Use cloud service",
        deadline: "2025-06-09T18:00:00Z",
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-20T10:00:00Z",
        tags: [],
      },
      {
        id: "task7",
        title: "Practice guitar",
        description: "New song: 'Imagine'",
        deadline: "2025-06-03T19:00:00Z",
        createdAt: "2025-05-14T10:00:00Z",
        updatedAt: "2025-05-14T10:00:00Z",
        tags: [
          {
            id: "tag1",
            name: "urgent",
            color: "red",
            createdAt: "2025-05-30T09:00:00Z",
            updatedAt: "2025-05-30T09:00:00Z",
          },
        ],
      },
    ],
  },
  {
    id: "status2",
    name: "In Progress",
    tasks: [
      {
        id: "task8",
        title: "Submit report",
        description: "Quarterly financial update",
        deadline: "2025-06-02T09:00:00Z",
        createdAt: "2025-05-29T08:00:00Z",
        updatedAt: "2025-05-30T08:00:00Z",
        tags: [],
      },
      {
        id: "task9",
        title: "Study for exam",
        description: "Review chapters 3-6",
        deadline: "2025-06-07T20:00:00Z",
        createdAt: "2025-05-26T10:00:00Z",
        updatedAt: "2025-05-26T10:00:00Z",
        tags: [],
      },
      {
        id: "task10",
        title: "Clean kitchen",
        description: "Wipe surfaces, mop floor",
        deadline: "2025-06-03T12:00:00Z",
        createdAt: "2025-05-27T10:00:00Z",
        updatedAt: "2025-05-27T10:00:00Z",
        tags: [
          {
            id: "tag1",
            name: "urgent",
            color: "red",
            createdAt: "2025-05-30T09:00:00Z",
            updatedAt: "2025-05-30T09:00:00Z",
          },
        ],
      },
      {
        id: "task11",
        title: "Watch tutorial",
        description: "React hooks deep dive",
        deadline: "2025-06-02T21:00:00Z",
        createdAt: "2025-05-16T10:00:00Z",
        updatedAt: "2025-05-16T10:00:00Z",
        tags: [],
      },
      {
        id: "task12",
        title: "Fix bike",
        description: "Patch flat tire",
        deadline: "2025-06-08T09:00:00Z",
        createdAt: "2025-05-22T10:00:00Z",
        updatedAt: "2025-05-22T10:00:00Z",
        tags: [],
      },
      {
        id: "task13",
        title: "Plant herbs",
        description: "Basil and parsley",
        deadline: "2025-06-06T17:00:00Z",
        createdAt: "2025-05-18T10:00:00Z",
        updatedAt: "2025-05-18T10:00:00Z",
        tags: [],
      },
    ],
  },
  {
    id: "status3",
    name: "Done",
    tasks: [
      {
        id: "task14",
        title: "Book dentist appointment",
        description: "Routine checkup",
        deadline: "2025-06-10T10:00:00Z",
        createdAt: "2025-05-28T10:00:00Z",
        updatedAt: "2025-05-28T10:00:00Z",
        tags: [],
      },
      {
        id: "task15",
        title: "Prepare slides for meeting",
        description: "Include recent KPIs",
        deadline: "2025-06-06T11:00:00Z",
        createdAt: "2025-05-24T10:00:00Z",
        updatedAt: "2025-05-24T10:00:00Z",
        tags: [],
      },
      {
        id: "task16",
        title: "Pay electricity bill",
        description: "Due June 3",
        deadline: "2025-06-03T23:59:00Z",
        createdAt: "2025-05-23T10:00:00Z",
        updatedAt: "2025-05-23T10:00:00Z",
        tags: [],
      },
      {
        id: "task17",
        title: "Update resume",
        description: "Add latest position",
        deadline: "2025-06-05T12:00:00Z",
        createdAt: "2025-05-21T10:00:00Z",
        updatedAt: "2025-05-21T10:00:00Z",
        tags: [],
      },
      {
        id: "task18",
        title: "Schedule car service",
        description: "Check brakes and oil",
        deadline: "2025-06-10T08:30:00Z",
        createdAt: "2025-05-19T10:00:00Z",
        updatedAt: "2025-05-19T10:00:00Z",
        tags: [],
      },
      {
        id: "task19",
        title: "Organize files",
        description: "Sort downloads folder",
        deadline: "2025-06-07T13:00:00Z",
        createdAt: "2025-05-17T10:00:00Z",
        updatedAt: "2025-05-17T10:00:00Z",
        tags: [],
      },
      {
        id: "task20",
        title: "Write journal entry",
        description: "Reflect on the week",
        deadline: "2025-06-01T22:00:00Z",
        createdAt: "2025-05-15T10:00:00Z",
        updatedAt: "2025-05-15T10:00:00Z",
        tags: [],
      },
    ],
  },
  {
    id: "status4",
    name: "bebebe",
    tasks: [],
  },
];
import GroupOfTasks from "@/components/GroupOfTasks";
import {
  ActionIcon,
  Box,
  Center,
  Flex,
  MultiSelect,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
export interface TagProps {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
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
  tasks: TaskProps[];
}

export default function Board() {
  const [groups, setGroups] = useState<GroupProps[]>(mockInfo);
  const [shownGroups, setShownGroups] = useState<string[]>(
    mockInfo
      .filter((group) => group.tasks && group.tasks.length > 0)
      .map((group) => group.name)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Если задача перемещается в другую группу
    if (activeId.startsWith("task") && overId.startsWith("status")) {
      setGroups((prevGroups) => {
        const newGroups = [...prevGroups];
        let movedTask: TaskProps | null = null;

        // Находим задачу и удаляем её из исходной группы
        for (const group of newGroups) {
          const taskIndex = group.tasks.findIndex(
            (task) => task.id === activeId
          );
          if (taskIndex !== -1) {
            movedTask = group.tasks[taskIndex];
            group.tasks.splice(taskIndex, 1);
            break;
          }
        }

        // Добавляем задачу в новую группу
        if (movedTask) {
          const targetGroupIndex = newGroups.findIndex(
            (group) => group.id === overId
          );
          if (targetGroupIndex !== -1) {
            newGroups[targetGroupIndex].tasks.push(movedTask);
          }
        }

        return newGroups;
      });
    }
  };

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
              data={mockInfo.map((group) => group.name)}
              value={shownGroups}
              onChange={setShownGroups}
            ></MultiSelect>
          </Box>
          <Flex
            gap="md"
            justify="flex-start"
            align="flex-start"
            direction="row"
          >
            {groups.map((group) =>
              shownGroups.includes(group.name) ? (
                <GroupOfTasks {...group} key={group.id}></GroupOfTasks>
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
              <Flex gap="sm" align="center" direction="row" wrap="nowrap">
                <ActionIcon variant="transparent">
                  <IconPlus color="black" size="xl"></IconPlus>
                </ActionIcon>
                <Title order={2}>Add new group</Title>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Center>
    </DndContext>
  );
}
