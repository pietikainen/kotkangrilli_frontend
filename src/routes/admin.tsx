import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
