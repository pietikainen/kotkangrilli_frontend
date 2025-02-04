import { Checkbox, Loader, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import useGetMemos from "../../api/useGetMemos.hook";

export const Route = createFileRoute("/dashboard/memo")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useGetMemos();

  if (isLoading) return <Loader />;

  return (
    <Stack>
      <Title order={2}>Muistilista</Title>
      {data?.data.data.map((memo: { id: number; note: string }) => (
        <Checkbox key={memo.id} label={memo.note} />
      ))}
    </Stack>
  );
}
