import {
  Button,
  Center,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { IconBrandDiscord } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useEffect } from "react";
import useGetUser from "../api/useGetUser.hook";
import kgLogo from "../assets/kg.jpg";
import ColorSchemeToggle from "../components/ColorSchemeToggle";
import ThemeSwitcher from "../components/ThemeSwitcher";
import classes from "./index.module.css";

export const Route = createFileRoute("/")({
  component: LoginComponent,
});

function FallingGrillBackground() {
  return (
    <div className={classes.fallingBackground} aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <div
          key={index}
          className={classes.fallingItem}
          style={
            {
              "--left": `${(index * 37 + 3) % 100}%`,
              "--duration": `${18 + ((index * 7) % 15)}s`,
              "--delay": `${-((index * 11) % 33)}s`,
              "--size": `${28 + ((index * 13) % 25)}px`,
              "--rotation": `${(index * 47) % 360}deg`,
              "--drift": `${index % 2 === 0 ? 60 : -60}px`,
            } as React.CSSProperties
          }
        >
          <svg
            viewBox="0 0 16 32"
            className={classes.pixelSprite}
            shapeRendering="crispEdges"
            focusable="false"
          >
            {index % 2 === 0 ? (
              <>
                <path
                  fill="#596579"
                  d="M3 1h2v7h1V1h2v7h1V1h2v7h1V1h2v10h-2v2h-2v17H6V13H4v-2H3z"
                />
                <path
                  fill="#c6d4df"
                  d="M3 1h1v8h9v2h-3v2H8v16H6V12H4v-2H3zM6 1h1v7H6zM9 1h1v7H9zM12 1h1v7h-1z"
                />
                <path fill="#f4f5df" d="M6 10h5v1H8v2H7v15H6z" />
              </>
            ) : (
              <>
                <path
                  fill="#863326"
                  d="M10 2h3v2h-1v1h2v5h-2v3h-1v7h1v3h2v5h-2v1h1v2h-3v-2H7v-2H5v-3H3v-4H2v-7h1V9h2V6h2V4h3z"
                />
                <path
                  fill="#df7445"
                  d="M9 5h3v4h-2v4H9v7h1v4h2v3H9v-2H7v-3H5v-3H4v-5h1v-4h2V7h2z"
                />
                <path
                  fill="#ffb36a"
                  d="M9 5h2v1H9v2H7v3H6v4H5v4H4v-5h1v-4h2V7h2zM5 20h1v3H5zM7 24h1v2H7z"
                />
                <path
                  fill="#a3412c"
                  d="M7 9h2v2h1v2H8v-2H7zM5 15h2v1h2v2H7v-1H5zM6 21h2v-1h1v2H8v1H6z"
                />
                <path fill="#f5a15c" d="M10 2h2v1h-2zM10 30h2v1h-2z" />
              </>
            )}
          </svg>
        </div>
      ))}
    </div>
  );
}

function LoginComponent() {
  const { data: user, isError, isPending, isSuccess } = useGetUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user?.data && isSuccess && !isError) {
      navigate({ to: "/dashboard" });
    }
  }, [isPending, isError, user, isSuccess, navigate]);

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <Center mih="100dvh" p="md" className={classes.page}>
      <FallingGrillBackground />
      <Paper shadow="md" className={classes.login}>
        <div className={classes.titlebar}>Kotkangrilli — Kirjautuminen</div>
        <Group justify="flex-end" p="xs">
          <ThemeSwitcher />
          <ColorSchemeToggle />
        </Group>
        <Stack gap="md" p="lg" pt={0}>
          <Group gap="md" wrap="nowrap">
            <Image
              src={kgLogo}
              alt="Kotkangrilli logo"
              w={48}
              h={48}
              className={classes.logo}
            />
            <Title order={1} className={classes.wordmark}>
              Kotkangrilli
            </Title>
          </Group>
          <Button
            fullWidth
            size="md"
            component="a"
            href={`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/auth/discord`}
            rightSection={<IconBrandDiscord />}
          >
            Kirjaudu Discordilla
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
