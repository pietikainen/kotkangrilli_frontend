import {
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  Spoiler,
  Stack,
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
  voteGroup?: string;
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
    nickname: string;
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
      <Stack gap={4} mt="xs">
        <Group gap={4}>
          {game.voteGroup && <Badge color="blue">{game.voteGroup}</Badge>}
          {getLink(game.link, game.store)}
        </Group>
        <Group gap={4}>
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
              game.isLan ? (
                <IconHomeLink size={14} />
              ) : (
                <IconNetwork size={14} />
              )
            }
            color={game.isLan ? "teal" : "orange"}
          >
            {game.isLan ? "LAN" : "Online"}
          </Badge>
        </Group>
      </Stack>
      <Spoiler
        mt="xs"
        mb="xs"
        maxHeight={isMobile ? 41 : undefined}
        showLabel="Näytä lisää"
        hideLabel="Piilota"
      >
        <Text c="dimmed" size="sm">
          {game.description}
        </Text>
      </Spoiler>
      <Group
        mt="auto"
        pt="xs"
        align="flex-end"
        justify="space-between"
        wrap="nowrap"
      >
        {"votes_amount" in game && (
          <Group gap="xs" miw={0}>
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
        <Tooltip
          label={user?.nickname || user?.username}
          position="top"
          events={{ hover: true, focus: true, touch: true }}
          withArrow
        >
          <Avatar
            ml="auto"
            style={{ flexShrink: 0 }}
            src={`https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.png`}
            size="sm"
            radius="xl"
            alt={user.nickname || user.username}
          >
            <Avatar
              src="https://cdn.discordapp.com/embed/avatars/0.png"
              size="sm"
              radius="xl"
              alt={user.nickname || user.username}
            />
          </Avatar>
        </Tooltip>
      </Group>
    </Card>
  );
}
