import { Loader, SimpleGrid, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetGameVotesByEventId from "../../../api/useGetGameVotesByEventId.hook";
import useGetUserProfiles from "../../../api/useGetUserProfiles.hook";
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

export const Route = createFileRoute("/dashboard/results/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: event, isPending: isPendingEvent } = useGetEvent(eventId);
  const { data: gameVotes, isPending } = useGetGameVotesByEventId(eventId);
  const { data: users, isPending: isPendingUsers } = useGetUserProfiles();

  if (isPending || isPendingEvent || isPendingUsers) return <Loader />;

  return (
    <>
      <Title order={2}>
        Peliäänestyksen tulokset - {event?.data.data.title}
      </Title>
      {gameVotes?.data.data.length > 0 && users?.data.length > 0 ? (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }}>
          {gameVotes?.data.data.map((result: GameVote) => (
            <GameWidget
              key={result.id}
              game={result}
              user={users?.data.find(
                (u: z.infer<typeof userSchema>) => u.id === result.submittedBy,
              )}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text>Äänestyksen tuloksia ei löytynyt</Text>
      )}
    </>
  );
}
