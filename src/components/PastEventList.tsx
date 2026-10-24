import { Stack } from "@mantine/core";
import React from "react";
import { z } from "zod";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import classes from "./EventCard.module.css";
import PastEventCard from "./PastEventCard";

export default function PastEventList({
  data,
  locations,
}: {
  data: z.infer<typeof eventSchema>[];
  locations: z.infer<typeof locationSchema>[];
}) {
  const sortedEvents = [...data].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <Stack gap="sm" mt="md" className={classes.list}>
      {sortedEvents.map((lanEvent) => (
        <PastEventCard
          key={lanEvent.id}
          lanEvent={lanEvent}
          locations={locations}
        />
      ))}
    </Stack>
  );
}
