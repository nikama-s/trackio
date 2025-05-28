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

export default function LoginForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length > 7 ? null : "Password too short"),
    },
  });

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
            height: "60vh",
            backgroundColor: "lightblue",
          }}
        >
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Flex
              gap="sm"
              justify="center"
              align="center"
              direction="column"
              wrap="wrap"
            >
              <Title order={1} mt={"5vh"} mb={"5vh"}>
                Login
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

              <Button w={"80%"} type="submit" mt="4vh" radius={"xl"}>
                LOGIN
              </Button>

              <Text mt="3vh" size="sm">
                Or Sign Up Using
              </Text>
              <Text
                c="black"
                fw={500}
                style={{ cursor: "pointer" }}
                onClick={() => alert("Надпись кликнута!")}
              >
                SIGN UP
              </Text>
            </Flex>
          </form>
        </Box>
      </Center>
    </MantineProvider>
  );
}
