import {
  Badge,
  Button,
  Group,
  Image,
  Modal,
  Spoiler,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
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

type Game = Omit<z.infer<typeof gameSchema>, "id">;

export default function VotingGameDetails({
  game,
  compact = false,
}: {
  game: Game;
  compact?: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 50em)");

  return (
    <Stack gap="xs">
      <Group wrap="nowrap" align="flex-start">
        <Image
          src={game.image}
          h={compact ? 64 : 100}
          w={compact ? 100 : "auto"}
          fit="cover"
          alt={game.title}
        />
        <Spoiler maxHeight={110} showLabel="Näytä lisää" hideLabel="Piilota">
          <Title order={compact ? 5 : 4}>{game.title}</Title>
        </Spoiler>
      </Group>
      <Group gap={4}>{getLink(game.link, game.store)}</Group>
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
            game.isLan ? <IconHomeLink size={14} /> : <IconNetwork size={14} />
          }
          color={game.isLan ? "teal" : "orange"}
        >
          {game.isLan ? "LAN" : "Online"}
        </Badge>
      </Group>
      {game.description && (
        <Spoiler
          mb="xs"
          maxHeight={isMobile || compact ? 41 : undefined}
          showLabel="Näytä lisää"
          hideLabel="Piilota"
        >
          <Text c="dimmed" size="sm">
            {game.description}
          </Text>
        </Spoiler>
      )}
    </Stack>
  );
}

export function VotingGroupDetails({
  name,
  members,
}: {
  name: string;
  members: Game[];
}) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Stack gap="sm">
        <Title order={4}>{name}</Title>
        <Group gap="xs">
          <Badge color="blue">Yhteisäänestys</Badge>
          <Text size="sm" c="dimmed">
            {members.length} {members.length === 1 ? "peli" : "peliä"}
          </Text>
        </Group>
        <Text size="sm" lineClamp={2}>
          {members.map((member) => member.title).join(", ")}
        </Text>
        <Text size="sm">Yksi ääni koko ryhmälle.</Text>
        <Button variant="light" onClick={open}>
          Näytä pelit
        </Button>
      </Stack>
      <Modal
        opened={opened}
        onClose={close}
        title={name}
        size="lg"
        closeButtonProps={{ "aria-label": "Sulje pelien tiedot" }}
      >
        <Stack gap="md">
          {members.map((member) => (
            <Stack
              key={member.externalApiId}
              pt="sm"
              style={{
                borderTop: "1px solid var(--mantine-color-default-border)",
              }}
            >
              <VotingGameDetails game={member} />
            </Stack>
          ))}
        </Stack>
      </Modal>
    </>
  );
}
