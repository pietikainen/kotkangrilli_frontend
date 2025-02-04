import { AppShell, Divider, Group, Loader, NavLink } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import React from "react";
import { z } from "zod";
import useGetEvents from "../api/useGetEvents.hook";
import useGetUser from "../api/useGetUser.hook";
import useVotecount from "../api/useVotecount.hook";
import UserMenu from "../components/UserMenu";
import eventSchema from "../schemas/eventSchema";
import ColorSchemeToggle from "./ColorSchemeToggle";

function AdminNav({ events }: { events: z.infer<typeof eventSchema>[] }) {
  const eventId = events?.findLast(
    (event) => event.active && dayjs().isBefore(event.endDate),
  )?.id;

  return (
    <>
      <Divider />
      <NavLink component={Link} to="/admin" label="ADMIN" />
      {eventId && (
        <NavLink
          component={Link}
          to={`/admin/schedule/${eventId}`}
          label="Aikataulu"
        />
      )}
      <NavLink component={Link} to="/admin/events" label="Tapahtumat" />
      <NavLink component={Link} to="/admin/users" label="Käyttäjät" />
      <NavLink component={Link} to="/admin/locations" label="Paikat" />
      <NavLink
        component={Link}
        to="/admin/game-suggestions"
        label="Peliehdotukset"
      />
    </>
  );
}

export default function Navbar() {
  const { data: user } = useGetUser();
  const { data: events, isLoading: isLoadingEvents } = useGetEvents();
  const activeEvent = events?.data.data.find(
    (event: z.infer<typeof eventSchema>) =>
      event.active && dayjs().isBefore(event.endDate),
  );

  const { data: votecount, isLoading: isLoadingVotecount } = useVotecount(
    activeEvent?.id,
  );

  if (isLoadingEvents || isLoadingVotecount) return <Loader />;

  return (
    <AppShell.Navbar p="md">
      <NavLink component={Link} to="/dashboard" label="Etusivu" />
      {(!activeEvent || activeEvent.votingState === 0) && (
        <NavLink
          component={Link}
          to="/dashboard/game-suggestions"
          label="Peliehdotukset"
        />
      )}
      {activeEvent && (
        <>
          {activeEvent.votingState === 1 && (
            <NavLink
              component={Link}
              to={`/dashboard/vote/${activeEvent.id}`}
              label="Peliäänestys"
            />
          )}
          {activeEvent.votingState === 3 && votecount?.data.data && (
            <NavLink
              component={Link}
              to={`/dashboard/results/${activeEvent.id}`}
              label="Peliäänestyksen tulokset"
            />
          )}
          {activeEvent.votingState === 3 && (
            <NavLink
              component={Link}
              to={`/dashboard/schedule/${activeEvent.id}`}
              label="Aikataulu"
            />
          )}
          <NavLink
            component={Link}
            to={`/dashboard/meals/${activeEvent.id}`}
            label="Ateriat"
          />
          <NavLink
            component={Link}
            to={`/dashboard/carpools/${activeEvent.id}`}
            label="Kimppakyydit"
          />
          <NavLink component={Link} to="/dashboard/memo" label="Muistilista" />
        </>
      )}
      {user?.data.userlevel > 7 && <AdminNav events={events?.data.data} />}
      <Divider hiddenFrom="sm" />
      <Group hiddenFrom="sm" mt="md">
        <ColorSchemeToggle />
        <UserMenu />
      </Group>
    </AppShell.Navbar>
  );
}
