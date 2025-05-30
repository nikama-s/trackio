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
import { useForm, matchesField, isEmail, hasLength } from "@mantine/form";
import Link from "next/link";
import { useRegister } from "@/hooks/useAuth";
import { useState } from "react";

export default function SignUpForm() {
  const register = useRegister();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    validateInputOnBlur: true,
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: isEmail("Invalid email"),
      password: hasLength({ min: 8 }, "Password too short"),
      confirmPassword: matchesField("password", "Passwords are not the same"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    register.mutate(values, {
      onError: (error) => {
        if (error?.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            form.setFieldError(
              field as keyof typeof values,
              messages.join(" ")
            );
          });
        }
        if (error?.error) {
          setGeneralError(error.error);
        }
      },
    });
  };

  return (
    <Center h="100vh" w="100vw" p="md">
      <Box
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "lightblue",
          borderRadius: "18px",
          padding: "2rem",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
              Sign up
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

            <PasswordInput
              w="100%"
              label="Confirm password"
              placeholder="Confirm your password"
              {...form.getInputProps("confirmPassword")}
            />
            {generalError && (
              <Text c="red" size="sm" mt="xs">
                {generalError}
              </Text>
            )}

            <Button w="100%" type="submit" mt="md" radius="xl">
              SIGN UP
            </Button>

            <Text mt="md" size="sm">
              Or Login Using
            </Text>
            <Link href="/auth/login">
              <Text c="black" fw={500} style={{ cursor: "pointer" }}>
                LOGIN
              </Text>
            </Link>
          </Flex>
        </form>
      </Box>
    </Center>
  );
}
