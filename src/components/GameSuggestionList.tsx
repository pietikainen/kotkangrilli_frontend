import {
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  SimpleGrid,
  Spoiler,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCurrencyEuro,
  IconCurrencyEuroOff,
  IconHomeLink,
  IconNetwork,
  IconUsers,
} from "@tabler/icons-react";
import React from "react";
import { z } from "zod";
import gameSchema from "../schemas/gameSchema";
import { getLink } from "../utils/getLink";

const GameSuggestion: React.FC<{
  game: z.infer<typeof gameSchema>;
  user: {
    id: number;
    username: string;
    snowflake: string;
    avatar: string;
  };
}> = ({ game, user }) => {
  const isMobile = useMediaQuery("(max-width: 50em)");

  return (
    <Card shadow="md" radius="md" withBorder p="xs">
      <Group wrap="nowrap">
        <Image src={game.image} h={100} w="auto" alt={game.title} />
        <Spoiler maxHeight={110} showLabel="Näytä lisää" hideLabel="Piilota">
          <Title order={4}>{game.title}</Title>
        </Spoiler>
      </Group>
      <Group mt="xs">
        {getLink(game.link, game.store)}
        <Badge
          leftSection={
            game.price > 0 ? (
              <IconCurrencyEuro size={14} />
            ) : (
              <IconCurrencyEuroOff size={14} />
            )
          }
          color={game.price > 0 ? "yellow" : "gray"}
        >
          {game.price > 0 ? `${game.price / 100}` : "Ilmainen"}
        </Badge>
        <Badge leftSection={<IconUsers size={14} />} color="grape">
          {game.players}
        </Badge>
        <Badge
          leftSection={
            game.isLan ? <IconHomeLink size={14} /> : <IconNetwork size={14} />
          }
          color={game.isLan ? "teal" : "orange"}
        >
          {game.isLan ? "LAN" : "Online"}
        </Badge>
      </Group>
      <Group justify="space-between" mt="xs">
        <Spoiler
          maxHeight={isMobile ? 41 : undefined}
          showLabel="Näytä lisää"
          hideLabel="Piilota"
        >
          <Text c="dimmed" size="sm">
            {game.description}
          </Text>
        </Spoiler>
        <Tooltip
          label={user?.username}
          position="top"
          events={{ hover: true, focus: true, touch: true }}
          withArrow
        >
          <Avatar
            src={`https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.png`}
            size="sm"
            radius="xl"
            alt={user.username}
          />
        </Tooltip>
      </Group>
    </Card>
  );
};

export default function GameSuggestionsList({
  games,
  userProfiles,
}: {
  games: z.infer<typeof gameSchema>[];
  userProfiles: {
    id: number;
    username: string;
    snowflake: string;
    avatar: string;
  }[];
}) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }}>
      {games.map((game) => {
        const user = userProfiles.find((u) => u.id === game.submittedBy);
        if (user)
          return <GameSuggestion game={game} key={game.id} user={user} />;
        return null;
      })}
    </SimpleGrid>
  );
}
