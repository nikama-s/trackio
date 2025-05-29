"use client";
import {
  Button,
  TextInput,
  Title,
  PasswordInput,
  Flex,
  Center,
  Box,
  Text,
} from "@mantine/core";
import { useForm, isEmail, hasLength } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const form = useForm({
    mode: "uncontrolled",
    validateInputOnBlur: true,
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: isEmail("Invalid email"),
      password: hasLength({ min: 8 }, "Password too short"),
    },
  });

  const router = useRouter();

  const handleSubmit = () => {
    router.push("/");
  };

  return (
    <Center h="100vh" w="100vw">
      <Box
        style={{
          width: "90%",
          maxWidth: 400,
          backgroundColor: "lightblue",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex
            gap="sm"
            justify="center"
            align="center"
            direction="column"
            wrap="wrap"
          >
            <Title order={2} mb="xl">
              Login
            </Title>

            <TextInput
              w="100%"
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              w="100%"
              label="Password"
              placeholder="Type your password"
              {...form.getInputProps("password")}
            />

            <Button w="100%" type="submit" mt="md" radius="xl">
              LOGIN
            </Button>

            <Text mt="md" size="sm">
              Or Sign Up Using
            </Text>
            <Link href="/auth/register">
              <Text c="black" fw={500} style={{ cursor: "pointer" }}>
                SIGN UP
              </Text>
            </Link>
          </Flex>
        </form>
      </Box>
    </Center>
  );
}
