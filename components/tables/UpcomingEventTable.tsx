import { useMemo } from 'react';
import { z } from 'zod';
import { Table } from '@mantine/core';
import EventRow from '@/components/EventRow';
import eventSchema from '@/schemas/eventSchema';
import locationSchema from '@/schemas/locationSchema';

export default function UpcomingEventTable({
  data,
  locations,
}: {
  data: z.infer<typeof eventSchema>[];
  locations: z.infer<typeof locationSchema>[];
}) {
  const rows = useMemo(
    () =>
      data.map((lanEvent) => (
        <EventRow key={lanEvent.id} lanEvent={lanEvent} locations={locations} />
      )),
    []
  );

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nimi</Table.Th>
          <Table.Th>Kuvaus</Table.Th>
          <Table.Th>Paikka</Table.Th>
          <Table.Th>Alkaa</Table.Th>
          <Table.Th>Päättyy</Table.Th>
          <Table.Th>Äänestys auki</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows.map((row) => row)}</Table.Tbody>
    </Table>
  );
}
