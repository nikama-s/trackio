import { Group, Text, Flex, ActionIcon } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import EditableText from "@/components/EditableText";
import Tag from "@/components/Tag";

interface TaskHeaderProps {
  title: string;
  tags: Array<{ id: string; name: string; color: string | null }>;
  onTitleChange: (value: string) => void;
  onEditTags: () => void;
}

export function TaskHeader({
  title,
  tags,
  onTitleChange,
  onEditTags
}: TaskHeaderProps) {
  return (
    <Group justify="space-between">
      <EditableText initialValue={title} onSubmit={onTitleChange} />
      <Group gap="xs">
        {tags.map((tag) => (
          <Tag {...tag} key={tag.id} />
        ))}
        <Flex
          align="center"
          direction="row"
          wrap="nowrap"
          style={{ cursor: "pointer" }}
          onClick={onEditTags}
        >
          <ActionIcon variant="transparent" size="sm">
            <IconEdit color="black" />
          </ActionIcon>
          <Text size="sm">Edit Tags</Text>
        </Flex>
      </Group>
    </Group>
  );
}
