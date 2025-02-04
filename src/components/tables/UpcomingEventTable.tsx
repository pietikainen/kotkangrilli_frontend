import { Table } from "@mantine/core";
import React, { useMemo } from "react";
import { z } from "zod";
import EventRow from "../../components/EventRow";
import eventSchema from "../../schemas/eventSchema";
import locationSchema from "../../schemas/locationSchema";

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
    [],
  );

  return (
    <Table.ScrollContainer minWidth={500} type="native">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tapahtuma</Table.Th>
            <Table.Th>Koska?</Table.Th>
            <Table.Th>Äänestys auki</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows.map((row) => row)}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
