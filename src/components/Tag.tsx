import { Badge } from "@mantine/core";

interface TagProps {
  name: string;
  color: string | null;
}

export default function Tag({ name, color }: TagProps) {
  return <Badge color={color ?? "white"}>{name}</Badge>;
}
