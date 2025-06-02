import { Modal, MultiSelect, Button, Group, Stack } from "@mantine/core";
import { useTags } from "@/hooks/useTags";
import { useUpdateTask } from "@/hooks/useTask";
import { useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { isEqual } from "lodash";

interface TagManagementModalProps {
  opened: boolean;
  onClose: () => void;
  taskId: string;
  currentTags: { id: string; name: string; color: string | null }[];
}

export default function TagManagementModal({
  opened,
  onClose,
  taskId,
  currentTags
}: TagManagementModalProps) {
  const { data: availableTags = [], isLoading: isLoadingTags } = useTags();
  const updateTask = useUpdateTask();
  const initialTagIds = useMemo(
    () => currentTags.map((tag) => tag.id),
    [currentTags]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);

  const hasChanges = useMemo(
    () => !isEqual(selectedTags.sort(), initialTagIds.sort()),
    [selectedTags, initialTagIds]
  );

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          tagIds: selectedTags
        }
      });

      notifications.show({
        title: "Success",
        message: "Tags updated successfully",
        color: "green"
      });

      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to update tags",
        color: "red"
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Manage Tags">
      <Stack pos="relative">
        <MultiSelect
          data={availableTags.map((tag) => ({
            value: tag.id,
            label: tag.name,
            color: tag.color
          }))}
          value={selectedTags}
          onChange={setSelectedTags}
          label="Select Tags"
          placeholder={selectedTags ? "" : "Choose tags"}
          searchable
          disabled={isLoadingTags || updateTask.isPending}
        />
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={onClose}
            disabled={updateTask.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={updateTask.isPending}
            disabled={isLoadingTags || !hasChanges}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
