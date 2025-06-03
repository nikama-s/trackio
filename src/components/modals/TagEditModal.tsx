import { Modal, MultiSelect, Button, Group, Stack } from "@mantine/core";
import { useTags } from "@/hooks/useTags";
import { useUpdateTask } from "@/hooks/useTask";
import { useState, useMemo, useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { isEqual } from "lodash";
import { TagManagementModal } from "./TagManagementModal";

interface TagManagementModalProps {
  opened: boolean;
  onClose: () => void;
  taskId: string;
  currentTags: { id: string; name: string; color: string | null }[];
}

export function TagEditModal({
  opened,
  onClose,
  taskId,
  currentTags
}: TagManagementModalProps) {
  const { data: availableTags = [], isLoading: isLoadingTags } = useTags();
  const updateTask = useUpdateTask();
  const [isTagEditModalOpen, setIsTagEditModalOpen] = useState(false);
  const initialTagIds = useMemo(
    () => currentTags.map((tag) => tag.id),
    [currentTags]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);

  const hasChanges = useMemo(
    () => !isEqual(selectedTags.sort(), initialTagIds.sort()),
    [selectedTags, initialTagIds]
  );

  const handleSave = useCallback(async () => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          tagIds: selectedTags
        }
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
  }, [onClose, selectedTags, taskId, updateTask]);

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Edit Tags">
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
          <Group justify="space-between">
            <Button
              variant="default"
              onClick={() => setIsTagEditModalOpen(true)}
              disabled={isLoadingTags || updateTask.isPending}
            >
              Manage Tags
            </Button>
            <Group>
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
          </Group>
        </Stack>
      </Modal>

      <TagManagementModal
        opened={isTagEditModalOpen}
        onClose={() => setIsTagEditModalOpen(false)}
      />
    </>
  );
}
