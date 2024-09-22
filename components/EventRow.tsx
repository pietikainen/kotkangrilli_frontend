import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Anchor, Button, Group, Modal, SegmentedControl, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import useAddParticipation from '@/api/useAddParticipation.hook';
import useDeleteParticipation from '@/api/useDeleteParticipation.hook';
import useGetParticipations from '@/api/useGetParticipations.hook';
import useGetUser from '@/api/useGetUser.hook';
import eventSchema from '@/schemas/eventSchema';
import locationSchema from '@/schemas/locationSchema';

import 'dayjs/locale/fi';

dayjs.locale('fi');
dayjs.extend(localizedFormat);

export default function EventRow({
  lanEvent,
  locations,
}: {
  lanEvent: z.infer<typeof eventSchema>;
  locations: z.infer<typeof locationSchema>[];
}) {
  const { data: user } = useGetUser();
  const { data: participations } = useGetParticipations(lanEvent.id);
  const [arrivalDate, setArrivalDate] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const addParticipation = useAddParticipation();
  const deleteParticipation = useDeleteParticipation();

  function onAddParticipation() {
    if (!lanEvent.id) return;

    addParticipation.mutate(
      {
        eventId: lanEvent.id,
        arrivalDate: dayjs(lanEvent.startDate).add(arrivalDate, 'day').toString(),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Ilmoittautuminen onnistui',
            message: 'Ilmoittautuminen onnistui',
            color: 'green',
          });
          close();
        },
        onError: () => {
          notifications.show({
            title: 'Ilmoittautuminen epäonnistui',
            message: 'Ilmoittautuminen epäonnistui',
            color: 'red',
          });
        },
      }
    );
  }

  function onDeleteParticipation() {
    deleteParticipation.mutate(
      participations?.data.data.find((p: { userId: number }) => p.userId === user?.data.id)?.id,
      {
        onSuccess: () => {
          notifications.show({
            title: 'Ilmoittautuminen peruttu',
            message: 'Ilmoittautuminen peruttu',
            color: 'green',
          });
          closeDelete();
        },
        onError: () => {
          notifications.show({
            title: 'Ilmoittautumisen peruminen epäonnistui',
            message: 'Ilmoittautumisen peruminen epäonnistui',
            color: 'red',
          });
        },
      }
    );
  }

  return (
    <Table.Tr key={lanEvent.id}>
      <Table.Td>{lanEvent.title}</Table.Td>
      <Table.Td>{lanEvent.description}</Table.Td>
      <Table.Td>{locations.find((l) => l.id === lanEvent.location)?.name}</Table.Td>
      <Table.Td>{dayjs(lanEvent.startDate).format('L LT')}</Table.Td>
      <Table.Td>{dayjs(lanEvent.endDate).format('L LT')}</Table.Td>
      <Table.Td>{lanEvent.votingOpen ? 'Kyllä' : 'Ei'}</Table.Td>
      <Table.Td>
        {!participations?.data.data.some((p: { userId: number }) => p.userId === user?.data.id) ? (
          <>
            <Button onClick={open}>Ilmoittaudu</Button>
            <Modal opened={opened} onClose={close} title="Ilmoittautuminen">
              <Text>Saapumispäivä</Text>
              <SegmentedControl
                value={String(arrivalDate)}
                onChange={(val) => setArrivalDate(Number(val))}
                data={[
                  { label: 'Torstai', value: '0' },
                  { label: 'Perjantai', value: '1' },
                  { label: 'Lauantai', value: '2' },
                ]}
              />
              <Group>
                <Button onClick={onAddParticipation}>Ilmoittaudu</Button>
                <Button onClick={close}>Peruuta</Button>
              </Group>
            </Modal>
          </>
        ) : (
          <Group>
            {lanEvent.votingOpen && (
              <Anchor component={Link} href={`dashboard/vote/${lanEvent.id}`}>
                Äänestys
              </Anchor>
            )}
            <Button onClick={openDelete}>Peru ilmoittautuminen</Button>
            <Modal opened={deleteOpened} onClose={closeDelete} title="Peru ilmoittautuminen">
              <p>
                Haluatko varmasti perua ilmoittautumisen? Tämä toiminto poistaa myös annetut
                peliäänesi.
              </p>
              <Group>
                <Button onClick={onDeleteParticipation}>Peru ilmoittautuminen</Button>
                <Button onClick={closeDelete}>Peruuta</Button>
              </Group>
            </Modal>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  );
}
