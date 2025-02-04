import { Grid, Loader, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetGames from "../../../api/useGetGames.hook";
import useVotecount from "../../../api/useVotecount.hook";
import GameWidget from "../../../components/GameWidget";
import gameSchema from "../../../schemas/gameSchema";

interface VoteResult {
  gameId: number;
  votes: number;
}

export const Route = createFileRoute("/dashboard/results/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: votecount, isLoading: isLoadingVotecount } =
    useVotecount(eventId);
  const { data: games, isLoading: isLoadingGames } = useGetGames();
  const [resultsSorted, setResultsSorted] = useState<VoteResult[]>([]);

  useEffect(() => {
    if (!votecount?.data.data) return;
    const newResultsSorted = [...votecount.data.data].sort(
      (a, b) => b.votes - a.votes,
    );
    setResultsSorted(newResultsSorted);
  }, [votecount]);

  if (isLoadingVotecount || isLoadingGames || isLoadingEvent) return <Loader />;

  return (
    <>
      <Title order={2}>
        Peliäänestyksen tulokset - {event?.data.data.title}
      </Title>
      {resultsSorted.length > 0 ? (
        <Grid>
          {resultsSorted.map((result: VoteResult) => (
            <Grid.Col key={result.gameId} span={{ base: 12, md: 6, lg: 3 }}>
              <GameWidget
                game={games?.data.data.find(
                  (game: z.infer<typeof gameSchema>) =>
                    game.id === result.gameId,
                )}
                votes={result.votes}
              />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Text>Äänestyksen tuloksia ei löytynyt</Text>
      )}
    </>
  );
}
