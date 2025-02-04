import { Loader } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import useGetActivitiesByEventId from "../../../api/useGetActivitiesByEventId.hook";
import Schedule from "../../../components/Schedule";

export const Route = createFileRoute("/dashboard/schedule/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: activities, isLoading: isLoadingActivities } =
    useGetActivitiesByEventId(eventId);

  if (isLoadingActivities) return <Loader />;

  if (!activities?.data.data || activities?.data.data.length === 0) {
    return <div>Aikataulua ei löytynyt, pahoittelut!</div>;
  }

  return <Schedule eventId={eventId} />;
}
