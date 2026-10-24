import { Anchor, Paper, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import "dayjs/locale/fi";
import classes from "./EventCard.module.css";

dayjs.extend(localizedFormat);

export default function EventCard({
  lanEvent,
  locations,
  past = false,
  footer,
  children,
}: {
  lanEvent: z.infer<typeof eventSchema>;
  locations: z.infer<typeof locationSchema>[];
  past?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const location = locations.find((item) => item.id === lanEvent.location);
  const dateFormat = past ? "L" : "L LT";

  return (
    <Paper
      component="article"
      withBorder
      p="md"
      radius="md"
      className={classes.eventCard}
    >
      <div className={classes.card}>
        <Stack gap="xs" className={classes.summary}>
          <Title order={3} size="h4">
            {past ? (
              <Anchor href={`/dashboard/events/${lanEvent.id}`} inherit>
                {lanEvent.title}
              </Anchor>
            ) : (
              lanEvent.title
            )}
          </Title>
          {location && <Text c="dimmed">@ {location.name}</Text>}
          {lanEvent.description && <Text>{lanEvent.description}</Text>}
        </Stack>
        <div className={classes.dates}>
          <Text>
            {dayjs(lanEvent.startDate).locale("fi").format(dateFormat)} –{" "}
            {dayjs(lanEvent.endDate).locale("fi").format(dateFormat)}
          </Text>
        </div>
        {children}
      </div>
      {footer && <div className={classes.footer}>{footer}</div>}
    </Paper>
  );
}
