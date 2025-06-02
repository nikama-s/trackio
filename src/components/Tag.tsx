import { Badge } from "@mantine/core";
import { TagProps } from "@/app/board/page";
export default function Tag({ name, color }: TagProps) {
  return <Badge color={color}>{name}</Badge>;
}
