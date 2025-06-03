import {
  TextInput,
  ColorInput,
  Button,
  Group,
  Text,
  Box,
  ActionIcon
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface ItemWithColor {
  id: string;
  name: string;
  color: string | null;
  isDefault: boolean;
}

interface EditableItemRowProps<T extends ItemWithColor> {
  item: T;
  editingState: {
    name: string;
    color: string;
  };
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  hasChanges: boolean;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
}

export function EditableItemRow<T extends ItemWithColor>({
  item,
  editingState,
  isEditing,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDelete,
  isUpdating,
  isDeleting,
  hasChanges,
  onNameChange,
  onColorChange
}: EditableItemRowProps<T>) {
  return (
    <Group key={item.id} align="center" wrap="nowrap">
      {isEditing ? (
        <>
          <TextInput
            value={editingState.name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={isUpdating || item.isDefault}
            style={{ flex: 1 }}
          />
          <ColorInput
            value={editingState.color}
            onChange={onColorChange}
            disabled={isUpdating}
            style={{ flex: 1 }}
          />
          <Group wrap="nowrap">
            <Button
              size="xs"
              onClick={onEditSave}
              loading={isUpdating}
              disabled={!hasChanges}
            >
              Save
            </Button>
            <Button
              size="xs"
              variant="default"
              onClick={onEditCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </Group>
        </>
      ) : (
        <>
          <Text style={{ flex: 1 }}>{item.name}</Text>
          <Group wrap="nowrap" gap="xs">
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: item.color || "#808080",
                border: "1px solid #ccc"
              }}
            />
            <Text size="sm" c="dimmed" style={{ width: 100 }}>
              {item.color || "No color"}
            </Text>
            <Group wrap="nowrap">
              <Button size="xs" onClick={onEditStart}>
                Edit
              </Button>
              <ActionIcon
                color="red"
                onClick={onDelete}
                disabled={item.isDefault || isDeleting}
                loading={isDeleting}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </>
      )}
    </Group>
  );
}
