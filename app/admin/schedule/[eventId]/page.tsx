'use client';

import Schedule from '@/components/Schedule';

export default function SchedulePage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);

  return <Schedule eventId={eventId} admin />;
}
