import {
  Avatar,
  Badge,
  Card,
  Group,
  Image,
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

interface GameVote {
  id: number;
  eventId: number;
  voting_round: number;
  externalApiId: number;
  title: string;
  image: string;
  price: number;
  link: string;
  store: string;
  players: number;
  isLan: boolean;
  submittedBy: number;
  description: string;
  votes_amount: number;
  is_winner: boolean;
  finalized: boolean;
}

export default function GameWidget({
  game,
  user,
}: {
  game: GameVote | z.infer<typeof gameSchema>;
  user: {
    id: number;
    username: string;
    snowflake: string;
    avatar: string;
  };
}) {
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
      {"votes_amount" in game && (
        <Group justify="space-between" mt="xs">
          <Text>Ääniä: {game.votes_amount}</Text>
          {game.is_winner && game.finalized && (
            <Badge color="green">Voittaja</Badge>
          )}
          {game.is_winner && !game.finalized && (
            <Badge color="yellow">Uusi äänestyskierros</Badge>
          )}
          {!game.is_winner && !game.finalized && (
            <Badge color="red">Ei voittoa</Badge>
          )}
        </Group>
      )}
    </Card>
  );
}
