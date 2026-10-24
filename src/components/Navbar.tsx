import {
  AppShell,
  Box,
  Divider,
  Group,
  Loader,
  NavLink,
  Paper,
  ScrollArea,
  Text,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCar,
  IconChartBar,
  IconCheckbox,
  IconChecklist,
  IconCoinEuro,
  IconDeviceGamepad2,
  IconHome,
  IconMapPin,
  IconNetwork,
  IconSettings,
  IconToolsKitchen2,
  IconUsers,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import React from "react";
import { z } from "zod";
import useGetEvents from "../api/useGetEvents.hook";
import useGetUser from "../api/useGetUser.hook";
import UserMenu from "../components/UserMenu";
import eventSchema from "../schemas/eventSchema";
import ColorSchemeToggle from "./ColorSchemeToggle";
import classes from "./Navbar.module.css";
import ThemeSwitcher from "./ThemeSwitcher";

function NavigationLink({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof IconHome;
  onClick: () => void;
}) {
  return (
    <NavLink
      component={Link}
      to={to}
      label={label}
      leftSection={<Icon size={18} stroke={1.6} />}
      activeOptions={{ exact: true }}
      onClick={onClick}
    />
  );
}

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
      <Divider my="md" />
      <Text className={classes.sectionLabel}>Hallinta</Text>
      <NavigationLink
        icon={IconSettings}
        to="/admin"
        label="ADMIN"
        onClick={onNavigate}
      />
      {eventId && (
        <>
          <NavigationLink
            icon={IconCalendarTime}
            to={`/admin/schedule/${eventId}`}
            label="Aikataulu"
            onClick={onNavigate}
          />
          <NavigationLink
            icon={IconChartBar}
            to={`/admin/results/${eventId}`}
            label="Tulokset"
            onClick={onNavigate}
          />
        </>
      )}
      <NavigationLink
        icon={IconCalendarEvent}
        to="/admin/events"
        label="Tapahtumat"
        onClick={onNavigate}
      />
      <NavigationLink
        icon={IconUsers}
        to="/admin/users"
        label="Käyttäjät"
        onClick={onNavigate}
      />
      <NavigationLink
        icon={IconMapPin}
        to="/admin/locations"
        label="Paikat"
        onClick={onNavigate}
      />
      <NavigationLink
        icon={IconDeviceGamepad2}
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

  return (
    <AppShell.Navbar p="sm">
      <AppShell.Section
        grow
        component={ScrollArea}
        type="auto"
        offsetScrollbars
      >
        <Text className={classes.sectionLabel}>Valikko</Text>
        {isLoadingEvents && <Loader size="xs" m="sm" />}
        <NavigationLink
          icon={IconHome}
          to="/dashboard"
          label="Etusivu"
          onClick={onNavigate}
        />
        {(!activeEvent || activeEvent.votingState === 0) && (
          <NavigationLink
            icon={IconDeviceGamepad2}
            to="/dashboard/game-suggestions"
            label="Peliehdotukset"
            onClick={onNavigate}
          />
        )}
        {activeEvent && (
          <>
            {(activeEvent.votingState === 2 ||
              activeEvent.votingState === 3) && (
              <NavigationLink
                icon={IconCheckbox}
                to={`/dashboard/vote/${activeEvent.id}`}
                label="Peliäänestys"
                onClick={onNavigate}
              />
            )}
            {activeEvent.votingState >= 3 && (
              <NavigationLink
                icon={IconChartBar}
                to={`/dashboard/results/${activeEvent.id}`}
                label="Peliäänestyksen tulokset"
                onClick={onNavigate}
              />
            )}
            {activeEvent.votingState >= 3 && (
              <NavigationLink
                icon={IconCalendarTime}
                to={`/dashboard/schedule/${activeEvent.id}`}
                label="Aikataulu"
                onClick={onNavigate}
              />
            )}
            <NavigationLink
              icon={IconToolsKitchen2}
              to={`/dashboard/meals/${activeEvent.id}`}
              label="Ateriat"
              onClick={onNavigate}
            />
            <NavigationLink
              icon={IconCar}
              to={`/dashboard/carpools/${activeEvent.id}`}
              label="Kimppakyydit"
              onClick={onNavigate}
            />
            <NavigationLink
              icon={IconChecklist}
              to="/dashboard/memo"
              label="Muistilista"
              onClick={onNavigate}
            />
          </>
        )}
        <NavigationLink
          icon={IconCoinEuro}
          to="/dashboard/payments"
          label="Maksut"
          onClick={onNavigate}
        />
        {user?.data.userlevel > 7 && (
          <AdminNav events={events?.data.data} onNavigate={onNavigate} />
        )}
      </AppShell.Section>
      <AppShell.Section pt="sm">
        {activeEvent && (
          <Paper p="sm" className={classes.event}>
            <Group gap="xs" wrap="nowrap" mb={6}>
              <IconNetwork size={16} aria-hidden="true" />
              <Text className={classes.eventLabel}>
                LAN / {dayjs(activeEvent.startDate).format("DD.MM.YYYY")}
              </Text>
            </Group>
            <Text size="sm" fw={600} lineClamp={2}>
              {activeEvent.title}
            </Text>
          </Paper>
        )}
        <Box hiddenFrom="sm">
          <Divider mt="sm" />
          <Group mt="sm" gap="xs">
            <ThemeSwitcher />
            <ColorSchemeToggle />
            <UserMenu />
          </Group>
        </Box>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
