'use client';

import { Button, Grid, Group, Loader, Modal, Paper, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import useGetCarpoolsByEventId from '@/api/useGetCarpoolsByEventId.hook';
import useGetEvent from '@/api/useGetEvent.hook';
import useGetParticipationsByEventId from '@/api/useGetParticipationsByEventId.hook';
import useGetUser from '@/api/useGetUser.hook';
import CarpoolWidget from '@/components/CarpoolWidget';
import CarpoolForm from '@/components/forms/CarpoolForm';

export default function MealsPage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);
  const { data: user } = useGetUser();
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: carpools, isLoading: isLoadingCarpools } = useGetCarpoolsByEventId(eventId);
  const { data: participations, isLoading: isLoadingParticipations } =
    useGetParticipationsByEventId(eventId);
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 50em)');

  if (isLoadingEvent || isLoadingCarpools || isLoadingParticipations) return <Loader />;

  const participation = participations?.data.data.find(
    (p: { userId: number }) => p.userId === user?.data.id
  );

  return (
    <>
      <Title order={2}>Kimppakyydit - {event?.data.data.title}</Title>
      <Group>
        {!participation && (
          <p>
            Voit lisätä kimppakyydin tai ilmoittautua kyytiläiseksi lan-ilmoittautumisen jälkeen.
          </p>
        )}
        <Button onClick={open} disabled={!participation}>
          Lisää kimppakyyti
        </Button>
      </Group>
      <Modal opened={opened} onClose={close} title="Kimppakyydin tiedot" fullScreen={isMobile}>
        <CarpoolForm close={close} eventId={eventId} />
      </Modal>
      <Grid grow>
        {carpools?.data.data.map((carpool: any) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={carpool.id}>
            <Paper shadow="sm" p={{ base: 'xs', sm: 'md', lg: 'xl' }}>
              <CarpoolWidget carpool={carpool} participation={participation} />
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
