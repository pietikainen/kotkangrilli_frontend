import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell, Divider, NavLink } from '@mantine/core';
import useGetUser from '@/api/useGetUser.hook';

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
  const pathname = usePathname();

  return (
    <AppShell.Navbar p="md">
      <NavLink
        component={Link}
        href="/dashboard"
        label="Etusivu"
        active={pathname === '/dashboard'}
      />
      <NavLink
        component={Link}
        href="/dashboard/game-suggestions"
        label="Peliehdotukset"
        active={pathname === '/dashboard/game-suggestions'}
      />
      {user?.data.userlevel > 7 && <AdminNav pathname={pathname} />}
    </AppShell.Navbar>
  );
}
