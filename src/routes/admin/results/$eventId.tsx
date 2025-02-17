import { Button, Grid, Loader, Text, Title } from "@mantine/core";
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

  if (isPending || isPendingEvent || isPendingUsers) return <Loader />;

  return (
    <>
      <Button onClick={() => mutate.mutate(eventId)}>Laske äänet</Button>
      <Title order={2}>
        Peliäänestyksen tulokset - {event?.data.data.title}
      </Title>
      {gameVotes?.data.data.length > 0 && users?.data.length > 0 ? (
        <Grid>
          {gameVotes?.data.data.map((result: GameVote) => (
            <Grid.Col key={result.id} span={{ base: 12, md: 6, lg: 3 }}>
              <GameWidget
                game={result}
                user={users?.data.find(
                  (u: z.infer<typeof userSchema>) =>
                    u.id === result.submittedBy,
                )}
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
