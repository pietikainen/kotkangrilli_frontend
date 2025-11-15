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
import Navbar from "./Navbar";
import UserMenu from "./UserMenu";

type CommonLayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: CommonLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const { data: user, isError, isPending, isSuccess } = useGetUser();

  useEffect(() => {
    if ((!isPending && !user?.data && isSuccess) || isError) {
      navigate({ to: "/" });
    }
  }, [isPending, isError, user, isSuccess]);

  if (isPending || !user) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" mx="md">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Image
              src={kgLogo}
              alt="Kotkangrilli logo"
              w={47.28}
              h={48}
              style={{ borderRadius: "0.5rem" }}
            />
            <Title>Kotkangrilli</Title>
          </Group>
          <Group visibleFrom="sm">
            <ColorSchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>
      <Navbar toggle={toggle} />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
