import {
  AppShell,
  Burger,
  Center,
  Group,
  Image,
  Loader,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import useGetUser from "../api/useGetUser.hook";
import kgLogo from "../assets/kg.jpg";
import ColorSchemeToggle from "./ColorSchemeToggle";
import classes from "./Layout.module.css";
import Navbar from "./Navbar";
import ThemeSwitcher from "./ThemeSwitcher";
import UserMenu from "./UserMenu";

type CommonLayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: CommonLayoutProps) => {
  const [opened, { toggle, close }] = useDisclosure();
  const navigate = useNavigate();
  const { data: user, isError, isPending, isSuccess } = useGetUser();

  useEffect(() => {
    if ((!isPending && !user?.data && isSuccess) || isError) {
      navigate({ to: "/" });
    }
  }, [isPending, isError, user, isSuccess, navigate]);

  if (isPending || !user) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="sm"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" mx="md">
          <Group className={classes.brand} wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label={opened ? "Sulje valikko" : "Avaa valikko"}
            />
            <Image
              src={kgLogo}
              alt="Kotkangrilli logo"
              w={32}
              h={32}
              className={classes.logo}
            />
            <Title order={1} className={classes.wordmark}>
              Kotkangrilli
            </Title>
          </Group>
          <Group visibleFrom="sm">
            <ThemeSwitcher />
            <ColorSchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>
      <Navbar onNavigate={close} />
      <AppShell.Main>
        <div className={classes.content}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
};
