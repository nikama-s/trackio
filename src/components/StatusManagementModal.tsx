import {
  Modal,
  TextInput,
  ColorInput,
  Button,
  Group,
  Stack,
  ActionIcon,
  Text,
  Box
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import {
  useStatuses,
  useCreateStatus,
  useUpdateStatus,
  useDeleteStatus,
  Status
} from "@/hooks/useStatuses";
import { useCallback, useState } from "react";
import { notifications } from "@mantine/notifications";

interface StatusEditModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function StatusManagementModal({
  opened,
  onClose
}: StatusEditModalProps) {
  const { data: statuses = [] } = useStatuses();
  const createStatus = useCreateStatus();
  const updateStatus = useUpdateStatus();
  const deleteStatus = useDeleteStatus();
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("");
  const [editingStatuses, setEditingStatuses] = useState<
    Record<string, { name: string; color: string }>
  >({});

  const handleCreateStatus = useCallback(async () => {
    if (!newStatusName.trim()) {
      notifications.show({
        title: "Error",
        message: "Status name is required",
        color: "red"
      });
      return;
    }

    await createStatus.mutateAsync({
      name: newStatusName.trim(),
      color: newStatusColor || undefined
    });

    setNewStatusName("");
    setNewStatusColor("");
  }, [createStatus, newStatusColor, newStatusName]);

  const handleUpdateStatus = useCallback(
    async (status: Status) => {
      const editedStatus = editingStatuses[status.id];
      if (!editedStatus) return;

      await updateStatus.mutateAsync({
        id: status.id,
        data: {
          name:
            !status.isDefault && editedStatus.name !== status.name
              ? editedStatus.name
              : undefined,
          color:
            editedStatus.color !== status.color ? editedStatus.color : undefined
        }
      });

      setEditingStatuses((prev) => {
        const newState = { ...prev };
        delete newState[status.id];
        return newState;
      });
    },
    [editingStatuses, updateStatus]
  );

  const handleDeleteStatus = useCallback(
    async (status: Status) => {
      await deleteStatus.mutateAsync(status.id);
    },
    [deleteStatus]
  );

  const startEditing = useCallback((status: Status) => {
    setEditingStatuses((prev) => ({
      ...prev,
      [status.id]: { name: status.name, color: status.color || "" }
    }));
  }, []);

  const cancelEditing = useCallback((statusId: string) => {
    setEditingStatuses((prev) => {
      const newState = { ...prev };
      delete newState[statusId];
      return newState;
    });
  }, []);

  const hasChanges = useCallback(
    (status: Status) => {
      const editedStatus = editingStatuses[status.id];
      if (!editedStatus) return false;
      if (status.isDefault) {
        return editedStatus.color !== (status.color || "");
      }
      return (
        editedStatus.name !== status.name ||
        editedStatus.color !== (status.color || "")
      );
    },
    [editingStatuses]
  );

  return (
    <Modal opened={opened} onClose={onClose} title="Manage Statuses" size="lg">
      <Stack gap="md">
        <Stack gap="xs">
          <TextInput
            label="New Status"
            placeholder="Enter status name"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            disabled={createStatus.isPending}
          />
          <ColorInput
            label="Color"
            placeholder="Pick a color"
            value={newStatusColor}
            onChange={setNewStatusColor}
            disabled={createStatus.isPending}
          />
          <Button
            onClick={handleCreateStatus}
            loading={createStatus.isPending}
            disabled={!newStatusName.trim()}
          >
            Create Status
          </Button>
        </Stack>

        <Stack gap="xs">
          <Text fw={500}>Existing Statuses</Text>
          <Box style={{ maxHeight: 300, overflowY: "auto" }}>
            <Stack gap="xs">
              {statuses.map((status) => {
                const isEditing = !!editingStatuses[status.id];
                const editedStatus = editingStatuses[status.id];

                return (
                  <Group key={status.id} align="center" wrap="nowrap">
                    {isEditing ? (
                      <>
                        <TextInput
                          value={editedStatus.name}
                          onChange={(e) =>
                            setEditingStatuses((prev) => ({
                              ...prev,
                              [status.id]: {
                                ...editedStatus,
                                name: e.target.value
                              }
                            }))
                          }
                          disabled={updateStatus.isPending || status.isDefault}
                          style={{ flex: 1 }}
                        />
                        <ColorInput
                          value={editedStatus.color}
                          onChange={(value) =>
                            setEditingStatuses((prev) => ({
                              ...prev,
                              [status.id]: { ...editedStatus, color: value }
                            }))
                          }
                          disabled={updateStatus.isPending}
                          style={{ flex: 1 }}
                        />
                        <Group wrap="nowrap">
                          <Button
                            size="xs"
                            onClick={() => handleUpdateStatus(status)}
                            loading={updateStatus.isPending}
                            disabled={!hasChanges(status)}
                          >
                            Save
                          </Button>
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() => cancelEditing(status.id)}
                            disabled={updateStatus.isPending}
                          >
                            Cancel
                          </Button>
                        </Group>
                      </>
                    ) : (
                      <>
                        <Text style={{ flex: 1 }}>{status.name}</Text>
                        <Group wrap="nowrap" gap="xs">
                          <Box
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: status.color || "#808080",
                              border: "1px solid #ccc"
                            }}
                          />
                          <Text size="sm" c="dimmed" style={{ width: 100 }}>
                            {status.color || "No color"}
                          </Text>
                          <Group wrap="nowrap">
                            <Button
                              size="xs"
                              onClick={() => startEditing(status)}
                            >
                              Edit
                            </Button>
                            <ActionIcon
                              color="red"
                              onClick={() => handleDeleteStatus(status)}
                              disabled={
                                status.isDefault || deleteStatus.isPending
                              }
                              loading={deleteStatus.isPending}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </>
                    )}
                  </Group>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Modal>
  );
}
