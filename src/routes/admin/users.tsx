import { Group, Loader, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import useGetUsers from "../../api/useGetUsers.hook";
import UserTable from "../../components/tables/UserTable";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
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
