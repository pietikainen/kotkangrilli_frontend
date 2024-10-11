import { useEffect, useState } from 'react';
import { IconDeviceGamepad, IconInfoSmall } from '@tabler/icons-react';
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
} from '@mantine/core';
import { getLink } from '@/utils/getLink';

export default function GameWidget({ game, votes }: { game: any; votes: number }) {
  const [fontSize, setFontSize] = useState('sm');

  useEffect(() => {
    let newFontSize = 'sm';
    const { length } = game.title;
    if (length <= 20) newFontSize = 'xl';
    else if (length <= 30) newFontSize = 'lg';
    else if (length <= 40) newFontSize = 'md';
    setFontSize(newFontSize);
  }, [game]);

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Flex mih={50} gap="xs" justify="flex-start" align="flex-start" direction="row" wrap="nowrap">
        <AspectRatio ratio={3 / 4} maw={40}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.image} alt={game.title} />
        </AspectRatio>
        <Text size={fontSize || 'md'} span>
          {game.title}
        </Text>
      </Flex>
      <Group mb={5}>
        {getLink(game.link)}
        {game.isLan && (
          <Badge color="blue" radius="sm">
            LAN
          </Badge>
        )}
        {game.store === 'NAS' ? (
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
      <Title order={4}>Ääniä: {votes}</Title>
    </Paper>
  );
}
