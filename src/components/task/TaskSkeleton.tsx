import {
  Card,
  Group,
  Stack,
  Divider,
  Flex,
  Skeleton,
  Container
} from "@mantine/core";

export function TaskSkeleton() {
  return (
    <Container className="w-full h-full">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        mt="3rem"
        maw={700}
        mx="auto"
        style={{ margin: 0 }}
      >
        <Stack>
          <Group justify="space-between">
            <Skeleton height={28} width={200} />
            <Group gap="xs">
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={80} />
              <Flex align="center" direction="row" wrap="nowrap">
                <Skeleton height={24} width={24} />
                <Skeleton height={20} width={100} ml={8} />
              </Flex>
            </Group>
          </Group>

          <Skeleton height={20} width={300} />

          <Divider />

          <Skeleton height={100} />

          <Divider />

          <Group justify="space-between">
            <Skeleton height={20} width={80} />
            <Skeleton height={28} width={150} />
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
