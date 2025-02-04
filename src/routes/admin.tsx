import { Center, Loader } from "@mantine/core";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import useGetUser from "../api/useGetUser.hook";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user, isError, isPending } = useGetUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending) {
      if (isError || !user) {
        navigate({ to: "/" });
      } else if (user.data.userlevel < 8) {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isPending, isError, user]);

  if (isPending || !user || user.data.userlevel < 8) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
