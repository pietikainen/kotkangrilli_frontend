import { noop } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { queryClient } from "../api/queryClient";
import { userQueryOptions } from "../api/useGetUser.hook";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/dashboard")({
  loader: () => {
    void queryClient.query(userQueryOptions).catch(noop);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
