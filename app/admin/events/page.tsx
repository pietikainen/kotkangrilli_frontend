'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button, Group, Loader, Modal, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import useDeleteEvent from '@/api/useDeleteEvent.hook';
import useGetEvents from '@/api/useGetEvents.hook';
import useGetLocations from '@/api/useGetLocations.hook';
import useGetUsers from '@/api/useGetUsers.hook';
import EventForm from '@/components/forms/EventForm';
import EventTable from '@/components/tables/EventTable';
import eventSchema from '@/schemas/eventSchema';

export default function LocationsPage() {
  const { data: events, isLoading } = useGetEvents();
  const { data: locations, isLoading: isLocationsLoading } = useGetLocations();
  const { data: users, isLoading: isUsersLoading } = useGetUsers();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [eventObject, setEventObject] = useState<z.infer<typeof eventSchema>>();
  const deleteEvent = useDeleteEvent();

  useEffect(() => {
    if (!opened && !deleteOpened) {
      setEventObject(undefined);
    }
  }, [opened, deleteOpened]);

  function onEdit(row: z.infer<typeof eventSchema>) {
    setEventObject(row);
    open();
  }

  function onDelete(row: z.infer<typeof eventSchema>) {
    setEventObject(row);
    openDelete();
  }

  async function onSubmitDelete(eventId: number | undefined) {
    if (!eventId) {
      notifications.show({
        title: 'Virhe',
        message: 'Tapahtumaa ei voitu poistaa',
        color: 'red',
      });
    } else {
      deleteEvent.mutate(eventId, {
        onSuccess: () => {
          notifications.show({
            title: 'Tapahtuma poistettu',
            message: 'Tapahtuma on poistettu onnistuneesti',
            color: 'green',
          });
          closeDelete();
        },
        onError: () => {
          notifications.show({
            title: 'Virhe',
            message: 'Tapahtumaa ei voitu poistaa',
            color: 'red',
          });
        },
      });
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Tapahtumat</Title>
        <Button onClick={open}>Lisää tapahtuma</Button>
      </Group>
      {isLoading || isLocationsLoading || isUsersLoading ? (
        <Loader />
      ) : (
        <EventTable
          data={events?.data.data}
          locations={locations?.data.data}
          users={users?.data}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
      <Modal
        opened={opened}
        onClose={() => {
          close();
        }}
        title="Tapahtuman tiedot"
      >
        <EventForm close={close} eventObject={eventObject} />
      </Modal>
      <Modal
        opened={deleteOpened}
        onClose={() => {
          closeDelete();
        }}
        title="Poista tapahtuma"
      >
        <Text>Haluatko varmasti poistaa tapahtuman?</Text>
        <h3>{eventObject?.title}</h3>
        <Group>
          <Button
            onClick={() => {
              closeDelete();
            }}
          >
            Peruuta
          </Button>
          <Button color="red" onClick={() => onSubmitDelete(eventObject?.id)}>
            Poista
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
