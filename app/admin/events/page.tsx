'use client';

import { Button, Group, Loader, Modal, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useGetEvents from '@/api/useGetEvents.hook';
import EventForm from '@/components/EventForm';
import EventTable from '@/components/EventTable';

export default function LocationsPage() {
  const { data: events, isLoading } = useGetEvents();
  const [opened, { open, close }] = useDisclosure(false);

  if (isLoading) return <Loader />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Tapahtumat</Title>
        <Button onClick={open}>Lisää tapahtuma</Button>
      </Group>
      <EventTable data={events?.data.data} />
      <Modal opened={opened} onClose={close} title="Tapahtuman tiedot">
        <EventForm close={close} />
      </Modal>
    </Stack>
  );
}
