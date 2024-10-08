'use client';

import { Button, Grid, Group, Loader, Modal, Paper } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import useGetEvent from '@/api/useGetEvent.hook';
import useGetMeals from '@/api/useGetMeals.hook';
import useGetParticipationsByEventId from '@/api/useGetParticipationsByEventId.hook';
import useGetUser from '@/api/useGetUser.hook';
import MealForm from '@/components/forms/MealForm';
import MealWidget from '@/components/MealWidget';

export default function MealsPage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);
  const { data: user } = useGetUser();
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: meals, isLoading: isLoadingMeals } = useGetMeals(eventId);
  const { data: participations, isLoading: isLoadingParticipations } =
    useGetParticipationsByEventId(eventId);
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 50em)');

  if (isLoadingEvent || isLoadingMeals || isLoadingParticipations) return <Loader />;

  const participation = participations?.data.data.find(
    (p: { userId: number }) => p.userId === user?.data.id
  );

  return (
    <>
      <h2>Ateriat - {event?.data.data.title}</h2>
      <Group>
        {!participation && (
          <p>Voit lisätä aterioita tai ilmoittautua syöjäksi ilmoittautumisen jälkeen.</p>
        )}
        <Button onClick={open} disabled={!participation}>
          Lisää ateria
        </Button>
      </Group>
      <Modal opened={opened} onClose={close} title="Aterian tiedot" fullScreen={isMobile}>
        <MealForm close={close} eventId={eventId} />
      </Modal>
      <Grid grow>
        {meals?.data.data.map((meal: any) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={meal.id}>
            <Paper shadow="sm" p={{ base: 'xs', sm: 'md', lg: 'xl' }}>
              <MealWidget meal={meal} participation={participation} />
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
