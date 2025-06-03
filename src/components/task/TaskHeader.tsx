import { Group, Text, Flex, ActionIcon, Stack } from "@mantine/core";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import EditableText from "@/components/EditableText";
import Tag from "@/components/Tag";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Group align="center">
          <ActionIcon
            variant="outline"
            size="md"
            onClick={() => router.push("/board")}
          >
            <IconArrowLeft size={24} />
          </ActionIcon>
          <div className="text-3xl">
            <EditableText
              initialValue={title}
              onSubmit={onTitleChange}
              size="lg"
            />
          </div>
        </Group>

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
    </Stack>
  );
}
