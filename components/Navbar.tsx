import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell, Divider, Group, Loader, NavLink } from '@mantine/core';
import useGetEvents from '@/api/useGetEvents.hook';
import useGetUser from '@/api/useGetUser.hook';
import ColorSchemeToggle from '@/components/ColorSchemeToggle';
import UserMenu from '@/components/UserMenu';

function AdminNav({ pathname }: { pathname: string }) {
  return (
    <>
      <Divider />
      <NavLink component={Link} href="/admin" label="ADMIN" active={pathname === '/admin'} />
      <NavLink
        component={Link}
        href="/admin/events"
        label="Tapahtumat"
        active={pathname === '/admin/events'}
      />
      <NavLink
        component={Link}
        href="/admin/users"
        label="Käyttäjät"
        active={pathname === '/admin/users'}
      />
      <NavLink
        component={Link}
        href="/admin/locations"
        label="Paikat"
        active={pathname === '/admin/locations'}
      />
      <NavLink
        component={Link}
        href="/admin/game-suggestions"
        label="Peliehdotukset"
        active={pathname === '/admin/game-suggestions'}
      />
    </>
  );
}

export default function Navbar() {
  const { data: user } = useGetUser();
  const { data: events, isLoading: isLoadingEvents } = useGetEvents();
  const pathname = usePathname();

  if (isLoadingEvents) return <Loader />;

  const activeEvent = events?.data.data.find(
    (event: { active: boolean; votingOpen: boolean }) => event.active && event.votingOpen
  );

  return (
    <AppShell.Navbar p="md">
      <NavLink
        component={Link}
        href="/dashboard"
        label="Etusivu"
        active={pathname === '/dashboard'}
      />
      {!activeEvent && (
        <NavLink
          component={Link}
          href="/dashboard/game-suggestions"
          label="Peliehdotukset"
          active={pathname === '/dashboard/game-suggestions'}
        />
      )}
      {activeEvent && (
        <>
          <NavLink
            component={Link}
            href={`/dashboard/vote/${activeEvent.id}`}
            label="Peliäänestys"
            active={pathname.startsWith('/dashboard/vote/')}
          />
          <NavLink
            component={Link}
            href={`/dashboard/meals/${activeEvent.id}`}
            label="Ateriat"
            active={pathname.startsWith('/dashboard/meals/')}
          />
          <NavLink
            component={Link}
            href={`/dashboard/carpools/${activeEvent.id}`}
            label="Kimppakyydit"
            active={pathname.startsWith('/dashboard/carpools/')}
          />
        </>
      )}
      {user?.data.userlevel > 7 && <AdminNav pathname={pathname} />}
      <Divider hiddenFrom="sm" />
      <Group hiddenFrom="sm" mt="md">
        <ColorSchemeToggle />
        <UserMenu />
      </Group>
    </AppShell.Navbar>
  );
}
