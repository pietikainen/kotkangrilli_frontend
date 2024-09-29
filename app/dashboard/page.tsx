'use client';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { z } from 'zod';
import { Grid, Loader, Paper } from '@mantine/core';
import useGetEvents from '@/api/useGetEvents.hook';
import useGetLocations from '@/api/useGetLocations.hook';
import useGetParticipationsByUserId from '@/api/useGetParticipationsByUserId.hook';
import useGetUser from '@/api/useGetUser.hook';
import EventWidget from '@/components/EventWidget';
import UpcomingEventTable from '@/components/tables/UpcomingEventTable';
import eventSchema from '@/schemas/eventSchema';

import 'dayjs/locale/fi';

dayjs.locale('fi');
dayjs.extend(localizedFormat);

export default function DashboardPage() {
  const { data: user } = useGetUser();
  const { data, isLoading } = useGetEvents();
  const { data: locations, isLoading: isLoadingLocations } = useGetLocations();
  const { data: participations, isLoading: isLoadingParticipations } = useGetParticipationsByUserId(
    user?.data.id
  );

  if (isLoading || isLoadingLocations || isLoadingParticipations) return <Loader />;

  const upcomingEvents = data?.data.data.filter(
    (lanEvent: z.infer<typeof eventSchema>) =>
      lanEvent.active && new Date() < new Date(lanEvent.startDate)
  );

  const participatingEvents = data?.data.data.filter(
    (lanEvent: z.infer<typeof eventSchema>) =>
      lanEvent.active &&
      participations?.data.data.find(
        (p: { eventId: number }) =>
          p.eventId === lanEvent.id && new Date() < new Date(lanEvent.endDate)
      )
  );

  return (
    <Grid grow>
      {participatingEvents.length > 0 &&
        participatingEvents.map((event: { id: number }) => (
          <EventWidget key={event.id} event={event} />
        ))}
      <Grid.Col span={12}>
        <Paper shadow="xs" p={{ base: 'xs', sm: 'md', lg: 'xl' }}>
          <h2>Tulevat tapahtumat</h2>
          {upcomingEvents.length > 0 ? (
            <UpcomingEventTable data={upcomingEvents} locations={locations?.data.data} />
          ) : (
            <p>Ei tulevia tapahtumia</p>
          )}
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
