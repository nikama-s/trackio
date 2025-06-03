import {
  Modal,
  TextInput,
  ColorInput,
  Button,
  Stack,
  Text,
  Box
} from "@mantine/core";
import {
  useStatuses,
  useCreateStatus,
  useUpdateStatus,
  useDeleteStatus,
  Status
} from "@/hooks/useStatuses";
import { useCallback, useState } from "react";
import { notifications } from "@mantine/notifications";
import { EditableItemRow } from "./components";

interface StatusEditModalProps {
  opened: boolean;
  onClose: () => void;
}

export function StatusManagementModal({
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
                  <EditableItemRow
                    key={status.id}
                    item={status}
                    editingState={editedStatus}
                    isEditing={isEditing}
                    onEditStart={() => startEditing(status)}
                    onEditCancel={() => cancelEditing(status.id)}
                    onEditSave={() => handleUpdateStatus(status)}
                    onDelete={() => handleDeleteStatus(status)}
                    isUpdating={updateStatus.isPending}
                    isDeleting={deleteStatus.isPending}
                    hasChanges={hasChanges(status)}
                    onNameChange={(name) =>
                      setEditingStatuses((prev) => ({
                        ...prev,
                        [status.id]: { ...editedStatus, name }
                      }))
                    }
                    onColorChange={(color) =>
                      setEditingStatuses((prev) => ({
                        ...prev,
                        [status.id]: { ...editedStatus, color }
                      }))
                    }
                  />
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Modal>
  );
}
