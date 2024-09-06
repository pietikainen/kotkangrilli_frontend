'use client';

import React, { useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { AppShell, Burger, Center, Group, Loader, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useGetUser from '@/api/useGetUser.hook';
import ColorSchemeToggle from '@/components/ColorSchemeToggle';
import Navbar from '@/components/Navbar';
import UserMenu from '@/components/UserMenu';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const { data: user, isError, isLoading } = useGetUser();

  useEffect(() => {
    if ((!isLoading && !user) || isError || user?.data.userlevel < 8) {
      router.push('/');
    }
  }, [isLoading, isError, user]);

  if (isLoading || !user || user.data.userlevel < 8) {
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
            <NextImage
              src="/kg.jpg"
              alt="Kotkangrilli logo"
              width={47.28}
              height={48}
              style={{ borderRadius: '0.5rem' }}
            />
            <Title>Kotkangrilli</Title>
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
