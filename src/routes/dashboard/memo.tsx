import { Button, Checkbox, Group, Loader, Stack, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import useGetMemos from "../../api/useGetMemos.hook";

export const Route = createFileRoute("/dashboard/memo")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useGetMemos();
  const [checkedMemos, setCheckedMemos, resetCheckedMemos] = useLocalStorage<
    Record<string, boolean>
  >({
    key: "kotkangrilli-memo-checked",
    defaultValue: {},
  });

  if (isLoading) return <Loader />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Muistilista</Title>
        <Button variant="light" onClick={resetCheckedMemos}>
          Nollaa valinnat
        </Button>
      </Group>
      {data?.data.data.map((memo: { id: number; note: string }) => (
        <Checkbox
          key={memo.id}
          label={memo.note}
          checked={checkedMemos?.[memo.id]}
          onChange={(event) => {
            const checked = event.currentTarget.checked;
            setCheckedMemos((current) => ({ ...current, [memo.id]: checked }));
          }}
        />
      ))}
    </Stack>
  );
}
