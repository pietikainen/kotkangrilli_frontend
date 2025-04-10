import { Grid, Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import React from "react";
import useGetEvent from "../../../api/useGetEvent.hook";
import EventWidget from "../../../components/EventWidget";
import PastEventWidget from "../../../components/PastEventWidget";

export const Route = createFileRoute("/dashboard/events/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);

  if (isLoadingEvent) return <Loader />;

  return (
    <Grid grow>
      {dayjs().isAfter(event?.data.data.endDate) ? (
        <PastEventWidget event={event?.data.data} />
      ) : (
        <EventWidget event={event?.data.data} />
      )}
    </Grid>
  );
}
