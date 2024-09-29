import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { z } from 'zod';
import { Button, Group, Modal, Table } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import useDeleteParticipation from '@/api/useDeleteParticipation.hook';
import useGetParticipationsByEventId from '@/api/useGetParticipationsByEventId.hook';
import useGetUser from '@/api/useGetUser.hook';
import eventSchema from '@/schemas/eventSchema';
import locationSchema from '@/schemas/locationSchema';

import 'dayjs/locale/fi';

import ParticipationForm from '@/components/forms/ParticipationForm';

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
  const { data: participations } = useGetParticipationsByEventId(lanEvent.id);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 50em)');

  const deleteParticipation = useDeleteParticipation();

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
      <Table.Td>
        <h3>{lanEvent.title}</h3>
        <span>@ {locations.find((l) => l.id === lanEvent.location)?.name}</span>
        <p>{lanEvent.description}</p>
      </Table.Td>
      <Table.Td>
        <p>{dayjs(lanEvent.startDate).format('L LT')}</p>
        <p>{dayjs(lanEvent.endDate).format('L LT')}</p>
      </Table.Td>
      <Table.Td>{lanEvent.votingOpen ? 'Kyllä' : 'Ei'}</Table.Td>
      <Table.Td>
        {!participations?.data.data.some((p: { userId: number }) => p.userId === user?.data.id) ? (
          <>
            <Button onClick={open}>Ilmoittaudu</Button>
            <Modal
              opened={opened}
              onClose={close}
              title="Ilmoittautuminen"
              fullScreen={isMobile}
              transitionProps={{ transition: 'fade', duration: 200 }}
            >
              <ParticipationForm lanEvent={lanEvent} close={close} />
            </Modal>
          </>
        ) : (
          <Group>
            <Button onClick={openDelete}>Peru ilmoittautuminen</Button>
            <Modal
              opened={deleteOpened}
              onClose={closeDelete}
              title="Peru ilmoittautuminen"
              fullScreen={isMobile}
              transitionProps={{
                transition: 'fade',
                duration: 200,
              }}
            >
              <h3>{lanEvent.title}</h3>
              <p>
                Haluatko varmasti perua ilmoittautumisen? Tämä toiminto poistaa myös annetut
                peliäänesi.
              </p>
              <Group mt={40}>
                <Button onClick={onDeleteParticipation} color="red">
                  Peru ilmoittautuminen
                </Button>
                <Button onClick={closeDelete} variant="default">
                  Peruuta
                </Button>
              </Group>
            </Modal>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  );
}
