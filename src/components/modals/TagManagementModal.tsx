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
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  Tag
} from "@/hooks/useTags";
import { useCallback, useState } from "react";
import { notifications } from "@mantine/notifications";
import { EditableItemRow } from "./components";

interface TagEditModalProps {
  opened: boolean;
  onClose: () => void;
}

export function TagManagementModal({ opened, onClose }: TagEditModalProps) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("");
  const [editingTags, setEditingTags] = useState<
    Record<string, { name: string; color: string }>
  >({});

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim()) {
      notifications.show({
        title: "Error",
        message: "Tag name is required",
        color: "red"
      });
      return;
    }

    await createTag.mutateAsync({
      name: newTagName.trim(),
      color: newTagColor || undefined
    });

    setNewTagName("");
    setNewTagColor("");
  }, [createTag, newTagColor, newTagName]);

  const handleUpdateTag = useCallback(
    async (tag: Tag) => {
      const editedTag = editingTags[tag.id];
      if (!editedTag) return;

      await updateTag.mutateAsync({
        id: tag.id,
        data: {
          name:
            !tag.isDefault && editedTag.name !== tag.name
              ? editedTag.name
              : undefined,
          color: editedTag.color !== tag.color ? editedTag.color : undefined
        }
      });

      setEditingTags((prev) => {
        const newState = { ...prev };
        delete newState[tag.id];
        return newState;
      });
    },
    [editingTags, updateTag]
  );

  const handleDeleteTag = useCallback(
    async (tag: Tag) => {
      await deleteTag.mutateAsync(tag.id);
    },
    [deleteTag]
  );

  const startEditing = useCallback((tag: Tag) => {
    setEditingTags((prev) => ({
      ...prev,
      [tag.id]: { name: tag.name, color: tag.color || "" }
    }));
  }, []);

  const cancelEditing = useCallback((tagId: string) => {
    setEditingTags((prev) => {
      const newState = { ...prev };
      delete newState[tagId];
      return newState;
    });
  }, []);

  const hasChanges = useCallback(
    (tag: Tag) => {
      const editedTag = editingTags[tag.id];
      if (!editedTag) return false;
      if (tag.isDefault) {
        return editedTag.color !== (tag.color || "");
      }
      return (
        editedTag.name !== tag.name || editedTag.color !== (tag.color || "")
      );
    },
    [editingTags]
  );

  return (
    <Modal opened={opened} onClose={onClose} title="Manage Tags" size="lg">
      <Stack gap="md">
        <Stack gap="xs">
          <TextInput
            label="New Tag"
            placeholder="Enter tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={createTag.isPending}
          />
          <ColorInput
            label="Color"
            placeholder="Pick a color"
            value={newTagColor}
            onChange={setNewTagColor}
            disabled={createTag.isPending}
          />
          <Button
            onClick={handleCreateTag}
            loading={createTag.isPending}
            disabled={!newTagName.trim()}
          >
            Create Tag
          </Button>
        </Stack>

        <Stack gap="xs">
          <Text fw={500}>Existing Tags</Text>
          <Box style={{ maxHeight: 300, overflowY: "auto" }}>
            <Stack gap="xs">
              {tags.map((tag) => {
                const isEditing = !!editingTags[tag.id];
                const editedTag = editingTags[tag.id];

                return (
                  <EditableItemRow
                    key={tag.id}
                    item={tag}
                    editingState={editedTag}
                    isEditing={isEditing}
                    onEditStart={() => startEditing(tag)}
                    onEditCancel={() => cancelEditing(tag.id)}
                    onEditSave={() => handleUpdateTag(tag)}
                    onDelete={() => handleDeleteTag(tag)}
                    isUpdating={updateTag.isPending}
                    isDeleting={deleteTag.isPending}
                    hasChanges={hasChanges(tag)}
                    onNameChange={(name) =>
                      setEditingTags((prev) => ({
                        ...prev,
                        [tag.id]: { ...editedTag, name }
                      }))
                    }
                    onColorChange={(color) =>
                      setEditingTags((prev) => ({
                        ...prev,
                        [tag.id]: { ...editedTag, color }
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
