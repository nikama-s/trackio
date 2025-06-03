import { Group, Text, Button, Popover, Stack, Select } from "@mantine/core";
import { IconCalendar, IconX, IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DatePicker } from "@mantine/dates";
import { Status } from "@prisma/client";

interface TaskStatusAndDeadlineProps {
  deadline: Date | null;
  statusId: string | null;
  statuses: Status[];
  onDeadlineChange: (date: string | null) => void;
  onStatusChange: (statusId: string | null) => void;
  onManageStatuses: () => void;
}

export function TaskStatusAndDeadline({
  deadline,
  statusId,
  statuses,
  onDeadlineChange,
  onStatusChange,
  onManageStatuses
}: TaskStatusAndDeadlineProps) {
  return (
    <Group justify="space-between">
      <Group gap={1}>
        <Text fw={500}>Deadline:</Text>
        <Popover position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Button variant="subtle" rightSection={<IconCalendar size={16} />}>
              {deadline
                ? dayjs(deadline).format("DD.MM.YYYY HH:mm")
                : "No deadline"}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <DatePicker
                value={deadline ? new Date(deadline) : null}
                onChange={onDeadlineChange}
              />
              {deadline && (
                <Button
                  variant="outline"
                  color="red"
                  onClick={() => onDeadlineChange(null)}
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
          value={statusId || null}
          onChange={onStatusChange}
          className="w-[150px]"
          data={statuses.map((status) => ({
            value: status.id,
            label: status.name,
            color: status.color
          }))}
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
            statusId ? (
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor:
                    statuses.find((s) => s.id === statusId)?.color || "gray"
                }}
              />
            ) : null
          }
        />
        <Button variant="default" size="xs" onClick={onManageStatuses}>
          Manage
        </Button>
      </Group>
    </Group>
  );
}
