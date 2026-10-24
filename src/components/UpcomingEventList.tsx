import { Stack } from "@mantine/core";
import React from "react";
import { z } from "zod";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import classes from "./EventCard.module.css";
import UpcomingEventCard from "./UpcomingEventCard";

export default function UpcomingEventList({
  data,
  locations,
}: {
  data: z.infer<typeof eventSchema>[];
  locations: z.infer<typeof locationSchema>[];
}) {
  return (
    <Stack gap="sm" mt="md" className={classes.list}>
      {data.map((lanEvent) => (
        <UpcomingEventCard
          key={lanEvent.id}
          lanEvent={lanEvent}
          locations={locations}
        />
      ))}
    </Stack>
  );
}
