import { Image } from "@mantine/core";
import React from "react";
import { z } from "zod";
import userSchema from "../schemas/userSchema";

export default function User({
  userId,
  users,
}: {
  userId: number;
  users: z.infer<typeof userSchema>[];
}) {
  const user = users.find(
    (u: { id?: number }) => u.id !== undefined && u.id === userId,
  );
  return (
    <>
      <Image
        src={`https://cdn.discordapp.com/avatars/${user?.snowflake}/${user?.avatar}.png?size=32`}
        alt={`${user?.username} avatar`}
        mah={32}
        w="auto"
        fit="contain"
      />
      {user?.username}
    </>
  );
}
