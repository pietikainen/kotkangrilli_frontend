'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Burger, Center, Group, Loader, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useGetUser from '@/api/useGetUser.hook';
import useLogout from '@/api/useLogout.hook';
import ColorSchemeToggle from '@/components/ColorSchemeToggle';
import Navbar from '@/components/Navbar';
import UserMenu from '@/components/UserMenu';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const { data: user, isError, isLoading } = useGetUser();
  const logout = useLogout();

  useEffect(() => {
    if ((!isLoading && !user?.data) || isError) {
      router.push('/');
    }
  }, [isLoading, isError, user]);

  useEffect(() => {
    if (logout.isSuccess) {
      router.push('/');
    }
  }, [logout.isSuccess]);

  if (isLoading || !user) {
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
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" mx="md">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title>KotkanGrilli</Title>
          </Group>
          <Group>
            <ColorSchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>
      <Navbar />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
