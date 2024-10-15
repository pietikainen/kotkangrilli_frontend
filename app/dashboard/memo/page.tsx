'use client';

import { Checkbox, Loader, Stack, Title } from '@mantine/core';
import useGetMemos from '@/api/useGetMemos.hook';

export default function MemoPage() {
  const { data, isLoading } = useGetMemos();

  if (isLoading) return <Loader />;

  return (
    <Stack>
      <Title order={2}>Muistilista</Title>
      {data?.data.data.map((memo: any) => <Checkbox label={memo.note} />)}
    </Stack>
  );
}
