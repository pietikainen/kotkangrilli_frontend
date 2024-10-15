'use client';

import { Loader } from '@mantine/core';
import useGetActivitiesByEventId from '@/api/useGetActivitiesByEventId.hook';
import Schedule from '@/components/Schedule';

export default function SchedulePage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);
  const { data: activities, isLoading: isLoadingActivities } = useGetActivitiesByEventId(eventId);

  if (isLoadingActivities) return <Loader />;

  if (!activities?.data.data || activities?.data.data.length === 0) {
    return <div>Aikataulua ei löytynyt, pahoittelut!</div>;
  }

  return <Schedule eventId={eventId} />;
}
