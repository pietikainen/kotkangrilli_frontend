'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconBrandDiscord } from '@tabler/icons-react';
import { Button, Center, Group, Loader, Stack, Title } from '@mantine/core';
import useGetUser from '@/api/useGetUser.hook';
import ColorSchemeToggle from '@/components/ColorSchemeToggle';

export default function HomePage() {
  const { data: user, isError, isLoading, isSuccess } = useGetUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isError && user?.data) {
      router.push('/dashboard');
    }
  }, [isLoading, user]);

  if (isLoading || isSuccess) {
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
          <Title order={1}>Kotkan grilin lani hasutus</Title>
          <ColorSchemeToggle />
        </Group>
        <Button
          component="a"
          href="http://localhost:5000/auth/discord"
          rightSection={<IconBrandDiscord />}
        >
          Kirjaudu sisään
        </Button>
      </Stack>
    </Center>
  );
}
