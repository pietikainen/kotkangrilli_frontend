'use client';

import { useEffect, useState } from 'react';
import { Grid, Loader, Title } from '@mantine/core';
import useGetEvent from '@/api/useGetEvent.hook';
import useGetGames from '@/api/useGetGames.hook';
import useVotecount from '@/api/useVotecount.hook';
import GameWidget from '@/components/GameWidget';

export default function ResultsPage({ params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: votecount, isLoading: isLoadingVotecount } = useVotecount(eventId);
  const { data: games, isLoading: isLoadingGames } = useGetGames();
  const [resultsSorted, setResultsSorted] = useState<any[]>([]);

  useEffect(() => {
    if (!votecount?.data.data) return;
    const newResultsSorted = [...votecount.data.data].sort((a, b) => b.votes - a.votes);
    setResultsSorted(newResultsSorted);
  }, [votecount]);

  if (isLoadingVotecount || isLoadingGames || isLoadingEvent) return <Loader />;

  return (
    <>
      <Title order={2}>Peliäänestyksen tulokset - {event?.data.data.title}</Title>
      {resultsSorted.length > 0 ? (
        <Grid>
          {resultsSorted.map((result: any) => (
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <GameWidget
                game={games?.data.data.find((game: any) => game.id === result.gameId)}
                votes={result.votes}
              />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <p>Äänestyksen tuloksia ei löytynyt</p>
      )}
    </>
  );
}
