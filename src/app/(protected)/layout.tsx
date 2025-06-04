"use client";

import { Box, Group, Text, ActionIcon } from "@mantine/core";
import { useAuthStore } from "@/store/authStore";
import { IconLogout } from "@tabler/icons-react";
import { useLogout } from "@/hooks/useAuth";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <Box>
      <Box
        style={{
          backgroundColor: "rgba(120, 155, 200, 0.9)",
          borderBottom: "1px solid rgba(0,0,0,0.1)"
        }}
        className="w-full h-[7vh] p-2 md:p-4"
      >
        <Group
          justify="space-between"
          wrap="nowrap"
          className="w-full md:px-10"
        >
          <Text size="28px" fw={700} c="white">
            Trackio
          </Text>
          <Group gap="xs" className="ml-auto items-center">
            <Text size="md" c="white">
              {user?.email}
            </Text>
            <ActionIcon
              variant="transparent"
              color="red"
              onClick={handleLogout}
              size="lg"
            >
              <IconLogout color="red" size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}
