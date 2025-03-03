import { SimpleGrid } from "@mantine/core";
import React from "react";
import { z } from "zod";
import gameSchema from "../schemas/gameSchema";
import GameWidget from "./GameWidget";

export default function GameSuggestionsList({
  games,
  userProfiles,
}: {
  games: z.infer<typeof gameSchema>[];
  userProfiles: {
    id: number;
    username: string;
    nickname: string;
    snowflake: string;
    avatar: string;
  }[];
}) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }}>
      {games.map((game) => {
        const user = userProfiles.find((u) => u.id === game.submittedBy);
        if (user) return <GameWidget game={game} user={user} key={game.id} />;
        return null;
      })}
    </SimpleGrid>
  );
}
