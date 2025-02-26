import { Button, Loader, SimpleGrid, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetGameVotesByEventId from "../../../api/useGetGameVotesByEventId.hook";
import useGetUserProfiles from "../../../api/useGetUserProfiles.hook";
import usePostCountVotesByEventId from "../../../api/usePostCalculateVotesByEventId.hook";
import GameWidget from "../../../components/GameWidget";
import userSchema from "../../../schemas/userSchema";

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

export const Route = createFileRoute("/admin/results/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: event, isPending: isPendingEvent } = useGetEvent(eventId);
  const { data: gameVotes, isPending } = useGetGameVotesByEventId(eventId);
  const mutate = usePostCountVotesByEventId();
  const { data: users, isPending: isPendingUsers } = useGetUserProfiles();

  const groupedVotes = React.useMemo(() => {
    if (!gameVotes?.data?.data || gameVotes.data.data.length === 0) return [];
    const grouped: Record<number, GameVote[]> = {};

    gameVotes.data.data.forEach((vote: GameVote) => {
      if (!grouped[vote.voting_round]) grouped[vote.voting_round] = [];
      grouped[vote.voting_round].push(vote);
    });

    // Sort keys in descending order to display highest round first
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((round) => ({ round, votes: grouped[round] }));
  }, [gameVotes]);

  if (isPending || isPendingEvent || isPendingUsers) return <Loader />;

  if (!gameVotes?.data?.data || gameVotes.data.data.length === 0) {
    return <Button onClick={() => mutate.mutate(eventId)}>Laske äänet</Button>;
  }

  return (
    <>
      <Button onClick={() => mutate.mutate(eventId)}>
        Laske äänet kierrokselle {groupedVotes[0].round + 1}
      </Button>
      <Title order={2}>
        Peliäänestyksen tulokset - {event?.data.data.title}
      </Title>
      {groupedVotes.map(({ round, votes }) => (
        <div key={round}>
          <Title order={3} mt="12">
            Kierros {round}
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }}>
            {votes.map((result: GameVote) => (
              <GameWidget
                key={result.id}
                game={result}
                user={users?.data.find(
                  (u: z.infer<typeof userSchema>) =>
                    u.id === result.submittedBy,
                )}
              />
            ))}
          </SimpleGrid>
        </div>
      ))}
    </>
  );
}
