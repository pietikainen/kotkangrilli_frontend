'use client';

import { Group, Loader, Stack, Title } from '@mantine/core';
import useGetUsers from '@/api/useGetUsers.hook';
import UserTable from '@/components/tables/UserTable';

export default function UsersPage() {
  const { data: users, isLoading } = useGetUsers();

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Käyttäjät</Title>
      </Group>
      {isLoading ? <Loader /> : <UserTable data={users?.data} />}
    </Stack>
  );
}
