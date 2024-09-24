'use client';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { z } from 'zod';
import { Loader, Paper } from '@mantine/core';
import useGetEvents from '@/api/useGetEvents.hook';
import useGetLocations from '@/api/useGetLocations.hook';
import eventSchema from '@/schemas/eventSchema';

import 'dayjs/locale/fi';

import UpcomingEventTable from '@/components/tables/UpcomingEventTable';

dayjs.locale('fi');
dayjs.extend(localizedFormat);

export default function DashboardPage() {
  const { data, isLoading } = useGetEvents();
  const { data: locations, isLoading: isLoadingLocations } = useGetLocations();

  if (isLoading || isLoadingLocations) return <Loader />;

  const upcomingEvents = data?.data.data.filter(
    (lanEvent: z.infer<typeof eventSchema>) =>
      lanEvent.active && new Date() < new Date(lanEvent.startDate)
  );

  return (
    <Paper shadow="xs" p={{ base: 'xs', sm: 'md', lg: 'xl' }}>
      <h2>Tulevat tapahtumat</h2>
      {upcomingEvents.length > 0 ? (
        <UpcomingEventTable data={upcomingEvents} locations={locations?.data.data} />
      ) : (
        <p>Ei tulevia tapahtumia</p>
      )}
    </Paper>
  );
}
