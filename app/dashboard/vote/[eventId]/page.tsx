'use client';

import { useEffect, useState } from 'react';
import { IconInfoSmall, IconUser } from '@tabler/icons-react';
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Button,
  Flex,
  Group,
  HoverCard,
  Loader,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useAddVote from '@/api/useAddVote.hook';
import useDeleteVote from '@/api/useDeleteVote.hook';
import useGetEvent from '@/api/useGetEvent.hook';
import useGetGames from '@/api/useGetGames.hook';
import useGetVotes from '@/api/useGetVotes.hook';
import { getLink } from '@/utils/getLink';

type FontSizeRecord = Record<number, 'xs' | 'sm' | 'md' | 'lg' | 'xl'>;

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default function VotePage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);
  const { data: event, isLoading } = useGetEvent(eventId);
  const { data: games, isLoading: isLoadingGames } = useGetGames();
  const { data: votes, isLoading: isLoadingVotes } = useGetVotes(eventId);

  const addVote = useAddVote();
  const deleteVote = useDeleteVote();

  const [fontSizes, setFontSizes] = useState<FontSizeRecord>({});
  const [gamesToVoteRandomized, setGamesToVoteRandomized] = useState<
    {
      id: number;
      title: string;
      image: string;
      link: string;
      isLan: boolean;
      price: number;
      description: string;
      store: string;
      players: number;
    }[]
  >([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const newFontSizes: FontSizeRecord = {};
    gamesToVoteRandomized.forEach((game: { id: number; title: string }) => {
      const { length } = game.title;
      if (length <= 20) newFontSizes[game.id] = 'xl';
      else if (length <= 30) newFontSizes[game.id] = 'lg';
      else if (length <= 40) newFontSizes[game.id] = 'md';
      else newFontSizes[game.id] = 'sm';
    });
    setFontSizes(newFontSizes);
  }, [gamesToVoteRandomized]);

  useEffect(() => {
    if (!games || !votes) return;
    const gamesToVote = games.data.data.filter(
      (game: { id: number }) =>
        !votes.data.data.find((vote: { gameId: number }) => vote.gameId === game.id)
    );
    const alreadyVotedGames = games.data.data.filter((game: { id: number }) =>
      votes.data.data.find((vote: { gameId: number }) => vote.gameId === game.id)
    );
    const filteredGames = gamesToVote.filter((game: { title: string }) =>
      game.title.toLowerCase().includes(filter.toLowerCase())
    );
    shuffleArray(filteredGames);
    const newGamesToVoteRandomized = [...alreadyVotedGames, ...filteredGames];
    setGamesToVoteRandomized(newGamesToVoteRandomized);
  }, [games, votes, filter]);

  if (isLoading || isLoadingGames || isLoadingVotes) return <Loader />;
  if (!event || event.data.data.active !== true) return <div>Tapahtumaa ei löytynyt</div>;
  if (!event.data.data.votingOpen) return <div>Äänestys ei ole avoinna</div>;
  if (!games || !votes) return <div>Tapahtumaa ei löytynyt</div>;

  return (
    <>
      <h2>Peliäänestys - {event.data.data.title}</h2>
      <Group>
        <p>Voit antaa {event.data.data.winnerGamesCount} ääntä</p>
        <TextInput
          placeholder="Hae peliä"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Group>
      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
          lg: 5,
        }}
        spacing={{
          base: 5,
          sm: 'md',
        }}
        verticalSpacing={{
          base: '5',
          sm: 'md',
        }}
      >
        {gamesToVoteRandomized.map(
          (game: {
            id: number;
            title: string;
            image: string;
            link: string;
            isLan: boolean;
            price: number;
            description: string;
            store: string;
            players: number;
          }) => (
            <Paper key={game.id} shadow="sm" p="lg" withBorder>
              <Flex
                mih={50}
                gap="xs"
                justify="flex-start"
                align="flex-start"
                direction="row"
                wrap="nowrap"
              >
                <AspectRatio ratio={3 / 4} maw={40}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.image} alt={game.title} />
                </AspectRatio>
                <Text size={fontSizes[game.id] || 'md'} span>
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
                  <IconUser />
                </Group>
              </Group>

              {votes.data.data.find((vote: { gameId: number }) => vote.gameId === game.id) ? (
                <Button
                  onClick={() => {
                    deleteVote.mutate(
                      votes.data.data.find((vote: { gameId: number }) => vote.gameId === game.id).id
                    );
                  }}
                  color="red"
                >
                  Poista ääni
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    addVote.mutate(
                      {
                        eventId,
                        gameId: game.id,
                      },
                      {
                        onSuccess: () => {
                          notifications.show({
                            message: 'Ääni lisätty',
                            color: 'green',
                          });
                        },
                      }
                    );
                  }}
                  disabled={votes.data.data.length >= event.data.data.winnerGamesCount}
                >
                  Äänestä
                </Button>
              )}
            </Paper>
          )
        )}
      </SimpleGrid>
    </>
  );
}
