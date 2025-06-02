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
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  Tag
} from "@/hooks/useTags";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface TagEditModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function TagEditModal({ opened, onClose }: TagEditModalProps) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("");
  const [editingTags, setEditingTags] = useState<
    Record<string, { name: string; color: string }>
  >({});

  const handleCreateTag = async () => {
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
  };

  const handleUpdateTag = async (tag: Tag) => {
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
  };

  const handleDeleteTag = async (tag: Tag) => {
    await deleteTag.mutateAsync(tag.id);
  };

  const startEditing = (tag: Tag) => {
    setEditingTags((prev) => ({
      ...prev,
      [tag.id]: { name: tag.name, color: tag.color || "" }
    }));
  };

  const cancelEditing = (tagId: string) => {
    setEditingTags((prev) => {
      const newState = { ...prev };
      delete newState[tagId];
      return newState;
    });
  };

  const hasChanges = (tag: Tag) => {
    const editedTag = editingTags[tag.id];
    if (!editedTag) return false;
    if (tag.isDefault) {
      return editedTag.color !== (tag.color || "");
    }
    return editedTag.name !== tag.name || editedTag.color !== (tag.color || "");
  };

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
                  <Group key={tag.id} align="center" wrap="nowrap">
                    {isEditing ? (
                      <>
                        <TextInput
                          value={editedTag.name}
                          onChange={(e) =>
                            setEditingTags((prev) => ({
                              ...prev,
                              [tag.id]: { ...editedTag, name: e.target.value }
                            }))
                          }
                          disabled={updateTag.isPending || tag.isDefault}
                          style={{ flex: 1 }}
                        />
                        <ColorInput
                          value={editedTag.color}
                          onChange={(value) =>
                            setEditingTags((prev) => ({
                              ...prev,
                              [tag.id]: { ...editedTag, color: value }
                            }))
                          }
                          disabled={updateTag.isPending}
                          style={{ flex: 1 }}
                        />
                        <Group wrap="nowrap">
                          <Button
                            size="xs"
                            onClick={() => handleUpdateTag(tag)}
                            loading={updateTag.isPending}
                            disabled={!hasChanges(tag)}
                          >
                            Save
                          </Button>
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() => cancelEditing(tag.id)}
                            disabled={updateTag.isPending}
                          >
                            Cancel
                          </Button>
                        </Group>
                      </>
                    ) : (
                      <>
                        <Text style={{ flex: 1 }}>{tag.name}</Text>
                        <Group wrap="nowrap" gap="xs">
                          <Box
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: tag.color || "#808080",
                              border: "1px solid #ccc"
                            }}
                          />
                          <Text size="sm" c="dimmed" style={{ width: 100 }}>
                            {tag.color || "No color"}
                          </Text>
                          <Group wrap="nowrap">
                            <Button size="xs" onClick={() => startEditing(tag)}>
                              Edit
                            </Button>
                            <ActionIcon
                              color="red"
                              onClick={() => handleDeleteTag(tag)}
                              disabled={tag.isDefault || deleteTag.isPending}
                              loading={deleteTag.isPending}
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
