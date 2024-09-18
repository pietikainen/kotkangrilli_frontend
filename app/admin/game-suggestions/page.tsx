'use client';

import { Group, Loader, Stack, Title } from '@mantine/core';
import useGetGames from '@/api/useGetGames.hook';
import useGetUsers from '@/api/useGetUsers.hook';
import AdminGameTable from '@/components/tables/AdminGameTable';

export default function GamesPage() {
  const { data: games, isLoading } = useGetGames();
  const { data: users, isLoading: isUsersLoading } = useGetUsers();

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Peliehdotukset</Title>
      </Group>
      {isLoading || isUsersLoading ? (
        <Loader />
      ) : (
        <AdminGameTable data={games?.data.data} users={users?.data} />
      )}
    </Stack>
  );
}
