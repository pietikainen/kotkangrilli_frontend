import { Avatar, Button, Loader, Menu } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import useGetUser from "../api/useGetUser.hook";
import useLogout from "../api/useLogout.hook";

export default function UserMenu() {
  const { data: user, isLoading } = useGetUser();
  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    if (logout.isSuccess) {
      navigate({ to: "/" });
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
            >
              <Avatar
                src="https://cdn.discordapp.com/embed/avatars/0.png"
                size="sm"
              />
            </Avatar>
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
