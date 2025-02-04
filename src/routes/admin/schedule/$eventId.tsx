import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import Schedule from "../../../components/Schedule";

export const Route = createFileRoute("/admin/schedule/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  return <Schedule eventId={Number(eventId)} admin />;
}
