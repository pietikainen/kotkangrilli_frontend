import {
  ActionIcon,
  AspectRatio,
  Badge,
  Flex,
  Group,
  HoverCard,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { IconDeviceGamepad, IconInfoSmall } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
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

export default function GameWidget({ game }: { game: GameVote }) {
  const [fontSize, setFontSize] = useState("sm");

  useEffect(() => {
    let newFontSize = "sm";
    const { length } = game.title;
    if (length <= 20) newFontSize = "xl";
    else if (length <= 30) newFontSize = "lg";
    else if (length <= 40) newFontSize = "md";
    setFontSize(newFontSize);
  }, [game]);

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Flex
        mih={50}
        gap="xs"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="nowrap"
      >
        <AspectRatio ratio={3 / 4} maw={40}>
          <img src={game.image} alt={game.title} />
        </AspectRatio>
        <Text size={fontSize || "md"}>{game.title}</Text>
      </Flex>
      <Group mb={5}>
        {getLink(game.link, game.store)}
        {game.isLan && (
          <Badge color="blue" radius="sm">
            LAN
          </Badge>
        )}
        {game.store === "NAS" ? (
          <Badge color="blue" radius="sm">
            NAS
          </Badge>
        ) : (
          `${game.price / 100} €`
        )}

        {game.description && (
          <HoverCard shadow="md">
            <HoverCard.Target>
              <ActionIcon>
                <IconInfoSmall />
              </ActionIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown>{game.description}</HoverCard.Dropdown>
          </HoverCard>
        )}
        <Group gap={2}>
          {game.players}
          <IconDeviceGamepad />
        </Group>
      </Group>
      <Title order={4}>Ääniä: {game.votes_amount}</Title>
    </Paper>
  );
}
