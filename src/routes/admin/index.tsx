import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Sinulla on voima muuttaa kaiken</div>;
}
