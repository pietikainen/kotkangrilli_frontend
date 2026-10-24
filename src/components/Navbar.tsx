import { AppShell, Divider, Group, Loader, NavLink } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import React from "react";
import { z } from "zod";
import useGetEvents from "../api/useGetEvents.hook";
import useGetUser from "../api/useGetUser.hook";
import UserMenu from "../components/UserMenu";
import eventSchema from "../schemas/eventSchema";
import ColorSchemeToggle from "./ColorSchemeToggle";

function AdminNav({
  events,
  onNavigate,
}: {
  events: z.infer<typeof eventSchema>[];
  onNavigate: () => void;
}) {
  const eventId = events?.findLast(
    (event) => event.active && dayjs().isBefore(event.endDate),
  )?.id;

  return (
    <>
      <Divider />
      <NavLink
        component={Link}
        to="/admin"
        label="ADMIN"
        onClick={onNavigate}
      />
      {eventId && (
        <>
          <NavLink
            component={Link}
            to={`/admin/schedule/${eventId}`}
            label="Aikataulu"
            onClick={onNavigate}
          />
          <NavLink
            component={Link}
            to={`/admin/results/${eventId}`}
            label="Tulokset"
            onClick={onNavigate}
          />
        </>
      )}
      <NavLink
        component={Link}
        to="/admin/events"
        label="Tapahtumat"
        onClick={onNavigate}
      />
      <NavLink
        component={Link}
        to="/admin/users"
        label="Käyttäjät"
        onClick={onNavigate}
      />
      <NavLink
        component={Link}
        to="/admin/locations"
        label="Paikat"
        onClick={onNavigate}
      />
      <NavLink
        component={Link}
        to="/admin/game-suggestions"
        label="Peliehdotukset"
        onClick={onNavigate}
      />
    </>
  );
}

export default function Navbar({ onNavigate }: { onNavigate: () => void }) {
  const { data: user } = useGetUser();
  const { data: events, isLoading: isLoadingEvents } = useGetEvents();
  const activeEvent = events?.data.data.find(
    (event: z.infer<typeof eventSchema>) =>
      event.active && dayjs().isBefore(event.endDate),
  );

  if (isLoadingEvents) return <Loader />;

  return (
    <AppShell.Navbar p="md">
      <NavLink
        component={Link}
        to="/dashboard"
        label="Etusivu"
        onClick={onNavigate}
      />
      {(!activeEvent || activeEvent.votingState === 0) && (
        <NavLink
          component={Link}
          to="/dashboard/game-suggestions"
          label="Peliehdotukset"
          onClick={onNavigate}
        />
      )}
      {activeEvent && (
        <>
          {(activeEvent.votingState === 2 || activeEvent.votingState === 3) && (
            <NavLink
              component={Link}
              to={`/dashboard/vote/${activeEvent.id}`}
              label="Peliäänestys"
              onClick={onNavigate}
            />
          )}
          {activeEvent.votingState >= 3 && (
            <NavLink
              component={Link}
              to={`/dashboard/results/${activeEvent.id}`}
              label="Peliäänestyksen tulokset"
              onClick={onNavigate}
            />
          )}
          {activeEvent.votingState >= 3 && (
            <NavLink
              component={Link}
              to={`/dashboard/schedule/${activeEvent.id}`}
              label="Aikataulu"
              onClick={onNavigate}
            />
          )}
          <NavLink
            component={Link}
            to={`/dashboard/meals/${activeEvent.id}`}
            label="Ateriat"
            onClick={onNavigate}
          />
          <NavLink
            component={Link}
            to={`/dashboard/carpools/${activeEvent.id}`}
            label="Kimppakyydit"
            onClick={onNavigate}
          />
          <NavLink
            component={Link}
            to="/dashboard/memo"
            label="Muistilista"
            onClick={onNavigate}
          />
        </>
      )}
      <NavLink
        component={Link}
        to="/dashboard/payments"
        label="Maksut"
        onClick={onNavigate}
      />
      {user?.data.userlevel > 7 && (
        <AdminNav events={events?.data.data} onNavigate={onNavigate} />
      )}
      <Divider hiddenFrom="sm" />
      <Group hiddenFrom="sm" mt="md">
        <ColorSchemeToggle />
        <UserMenu />
      </Group>
    </AppShell.Navbar>
  );
}
