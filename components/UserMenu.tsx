import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { Avatar, Button, Loader, Menu } from '@mantine/core';
import useGetUser from '@/api/useGetUser.hook';
import useLogout from '@/api/useLogout.hook';

export default function UserMenu() {
  const { data: user, isLoading } = useGetUser();
  const logout = useLogout();

  useEffect(() => {
    if (logout.isSuccess) {
      redirect('/');
    }
  }, [logout.isSuccess]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Menu withArrow>
      <Menu.Target>
        <Button
          variant="default"
          color="gray"
          leftSection={
            <Avatar
              src={`https://cdn.discordapp.com/avatars/${
                user?.data.snowflake
              }/${user?.data.avatar}.png?size=24`}
              size="sm"
            />
          }
        >
          {user?.data.username}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => logout.mutate()} disabled={logout.isPending}>
          Kirjaudu ulos
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
