"use client";
import "@mantine/core/styles.css";
import {
  Button,
  MantineProvider,
  TextInput,
  Title,
  PasswordInput,
  Flex,
  Center,
  Box,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const form = useForm({
    mode: "uncontrolled",
    validateInputOnBlur: true,
    initialValues: {
      email: "",
      password: "",
      confirmedPassword: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length > 7 ? null : "Password too short"),
      confirmedPassword: (value, values) =>
        value == values.password ? null : "Passwords do not match",
    },
  });

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    router.push("/dashboard");
  };

  return (
    <MantineProvider
      theme={{
        fontFamily: '"Comic Sans MS", cursive, sans-serif',
      }}
    >
      <Center h="100vh" w="100vw">
        <Box
          style={{
            width: "25vw",
            height: "65vh",
            backgroundColor: "lightblue",
            borderRadius: "18px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Flex
              gap="sm"
              justify="center"
              align="center"
              direction="column"
              wrap="wrap"
            >
              <Title order={1} mt={"5vh"} mb={"5vh"}>
                Sign up
              </Title>

              <TextInput
                w={"80%"}
                label="Email"
                placeholder="your@email.com"
                {...form.getInputProps("email")}
              />

              <PasswordInput
                w={"80%"}
                label="Password"
                placeholder="Type your password"
                {...form.getInputProps("password")}
              />

              <PasswordInput
                w={"80%"}
                label="Confirm password"
                placeholder="Confirm your password"
                {...form.getInputProps("confirmedPassword")}
              />

              <Button w={"80%"} type="submit" mt="4vh" radius={"xl"}>
                SIGN UP
              </Button>

              <Text mt="3vh" size="sm">
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
    </MantineProvider>
  );
}
