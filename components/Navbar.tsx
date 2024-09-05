import React from 'react';
import Link from 'next/link';
import { AppShell, Divider, NavLink } from '@mantine/core';
import useGetUser from '@/api/useGetUser.hook';

function AdminNav() {
  return (
    <>
      <Divider />
      <NavLink component={Link} href="/admin" label="ADMIN" />
      <NavLink component={Link} href="/admin/events" label="Tapahtumat" />
      {/*<NavLink component={Link} href="/admin/users" label="Käyttäjät" />*/}
      <NavLink component={Link} href="/admin/locations" label="Paikat" />
      {/*user?.data.userlevel > 7 && <NavLink component={Link} href="/admin/games" label="Pelit" />*/}
    </>
  );
}

export default function Navbar() {
  const { data: user } = useGetUser();

  return (
    <AppShell.Navbar p="md">
      <NavLink component={Link} href="/dashboard" label="Etusivu" />
      <NavLink component={Link} href="/dashboard/game-suggestions" label="Peliehdotukset" />
      {user?.data.userlevel > 7 && <AdminNav />}
    </AppShell.Navbar>
  );
}
