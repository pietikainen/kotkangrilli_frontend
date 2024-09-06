'use client';

import { useEffect } from 'react';
import NextImage from 'next/image';
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
          <NextImage
            src="/kg.jpg"
            alt="Kotkangrilli logo"
            width={98.5}
            height={100}
            style={{ borderRadius: '0.5rem' }}
          />
          <Title order={1}>Kotkangrilli</Title>
          <ColorSchemeToggle />
        </Group>
        <Button
          component="a"
          href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/discord`}
          rightSection={<IconBrandDiscord />}
        >
          Kirjaudu sisään
        </Button>
      </Stack>
    </Center>
  );
}
