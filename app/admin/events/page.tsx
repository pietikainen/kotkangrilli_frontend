'use client';

import { Button, Group, Loader, Modal, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useGetEvents from '@/api/useGetEvents.hook';
import useGetLocations from '@/api/useGetLocations.hook';
import useGetUsers from '@/api/useGetUsers.hook';
import EventForm from '@/components/EventForm';
import EventTable from '@/components/EventTable';

export default function LocationsPage() {
  const { data: events, isLoading } = useGetEvents();
  const { data: locations, isLoading: isLocationsLoading } = useGetLocations();
  const { data: users, isLoading: isUsersLoading } = useGetUsers();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Tapahtumat</Title>
        <Button onClick={open}>Lisää tapahtuma</Button>
      </Group>
      {isLoading || isLocationsLoading || isUsersLoading ? (
        <Loader />
      ) : (
        <EventTable data={events?.data.data} locations={locations?.data.data} users={users?.data} />
      )}
      <Modal opened={opened} onClose={close} title="Tapahtuman tiedot">
        <EventForm close={close} />
      </Modal>
    </Stack>
  );
}
