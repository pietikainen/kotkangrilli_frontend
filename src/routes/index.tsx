import {
  Button,
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Title,
} from "@mantine/core";
import { IconBrandDiscord } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useEffect } from "react";
import useGetUser from "../api/useGetUser.hook";
import ColorSchemeToggle from "../components/ColorSchemeToggle";

export const Route = createFileRoute("/")({
  component: LoginComponent,
});

function LoginComponent() {
  const { data: user, isError, isPending, isSuccess } = useGetUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user?.data && isSuccess && !isError) {
      navigate({ to: "/dashboard" });
    }
  }, [isPending, isError, user, isSuccess]);

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <Center h="100vh">
      <Stack align="center">
        <Group>
          <Image
            src="/src/assets/kg.jpg"
            alt="Kotkangrilli logo"
            w={98.5}
            h={100}
            style={{ borderRadius: "0.5rem" }}
          />
          <Title order={1}>Kotkangrilli</Title>
          <ColorSchemeToggle />
        </Group>
        <Button
          component="a"
          href={`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/auth/discord`}
          rightSection={<IconBrandDiscord />}
        >
          Kirjaudu sisään
        </Button>
      </Stack>
    </Center>
  );
}
