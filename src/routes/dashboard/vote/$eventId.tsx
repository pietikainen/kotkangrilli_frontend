import {
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Spoiler,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCurrencyEuro,
  IconCurrencyEuroOff,
  IconHomeLink,
  IconNetwork,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import { z } from "zod";
import useAddVote from "../../../api/useAddVote.hook";
import useDeleteVote from "../../../api/useDeleteVote.hook";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetGames from "../../../api/useGetGames.hook";
import useGetGameVotesByEventId from "../../../api/useGetGameVotesByEventId.hook";
import useGetParticipationsByEventId from "../../../api/useGetParticipationsByEventId.hook";
import useGetUser from "../../../api/useGetUser.hook";
import useGetUserProfiles from "../../../api/useGetUserProfiles.hook";
import useGetVotes from "../../../api/useGetVotes.hook";
import VoteButton from "../../../components/VoteButton";
import gameSchema from "../../../schemas/gameSchema";
import userSchema from "../../../schemas/userSchema";
import { getLink } from "../../../utils/getLink";

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

function shuffleArray(array: (GameVote | z.infer<typeof gameSchema>)[]) {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const Route = createFileRoute("/dashboard/vote/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: user } = useGetUser();
  const { data: event, isPending } = useGetEvent(eventId);
  const { data: games, isPending: isPendingGames } = useGetGames();
  const { data: votesData, isPending: isPendingVotes } = useGetVotes(eventId);
  const { data: participations, isPending: isPendingParticipations } =
    useGetParticipationsByEventId(eventId);
  const { data: users, isPending: isPendingUsers } = useGetUserProfiles();
  const { data: gameVotes, isPending: isPendingGameVotes } =
    useGetGameVotesByEventId(eventId);

  const addVote = useAddVote();
  const deleteVote = useDeleteVote();

  const isMobile = useMediaQuery("(max-width: 50em)");
  const [filter, setFilter] = useState<string>("");

  const votingRound = useMemo(() => {
    if (!gameVotes?.data?.data || gameVotes.data.data.length === 0) return 1;
    const lastRound = gameVotes.data.data.sort(
      (a: { voting_round: number }, b: { voting_round: number }) =>
        a.voting_round - b.voting_round,
    );
    return lastRound[0].voting_round + 1;
  }, [gameVotes]);

  const maxVotes = React.useMemo(() => {
    if (!event?.data?.data) return 0;
    const finalizedGames =
      gameVotes?.data?.data?.filter(
        (game: { finalized: boolean }) => game.finalized,
      ) ?? [];
    return event.data.data.winnerGamesCount - finalizedGames.length;
  }, [gameVotes, event]);

  const votes = votesData?.data.data.filter(
    (vote: { voting_round: number }) => vote.voting_round === votingRound,
  );

  const gamesToVoteRandomized = useMemo(() => {
    if (!games || !votes || !gameVotes) return [];
    let gamesToVote: (GameVote | z.infer<typeof gameSchema>)[];
    let alreadyVotedGames: (GameVote | z.infer<typeof gameSchema>)[];
    if (votingRound > 1) {
      gamesToVote = gameVotes.data.data.filter(
        (game: {
          externalApiId: number;
          voting_round: number;
          finalized: boolean;
          is_winner: boolean;
        }) =>
          !game.finalized &&
          game.is_winner &&
          game.voting_round === votingRound - 1 &&
          !votes.find(
            (vote: { externalApiId: number; voting_round: number }) =>
              vote.externalApiId === game.externalApiId &&
              vote.voting_round === votingRound,
          ),
      );
      alreadyVotedGames = gameVotes.data.data.filter(
        (game: {
          externalApiId: number;
          voting_round: number;
          finalized: boolean;
          is_winner: boolean;
        }) =>
          !game.finalized &&
          game.is_winner &&
          game.voting_round === votingRound - 1 &&
          votes.find(
            (vote: { externalApiId: number; voting_round: number }) =>
              vote.externalApiId === game.externalApiId &&
              vote.voting_round === votingRound,
          ),
      );
    } else {
      gamesToVote = games.data.data.filter(
        (game: { externalApiId: number }) =>
          !votes.find(
            (vote: { externalApiId: number }) =>
              vote.externalApiId === game.externalApiId,
          ),
      );
      alreadyVotedGames = games.data.data.filter(
        (game: { externalApiId: number }) =>
          votes.find(
            (vote: { externalApiId: number }) =>
              vote.externalApiId === game.externalApiId,
          ),
      );
    }
    const filteredGames = gamesToVote.filter((game: { title: string }) =>
      game.title.toLowerCase().includes(filter.toLowerCase()),
    );
    shuffleArray(filteredGames);
    return [...alreadyVotedGames, ...filteredGames];
  }, [games, votes, filter, gameVotes, votingRound]);

  if (
    isPending ||
    isPendingGames ||
    isPendingVotes ||
    isPendingParticipations ||
    isPendingUsers ||
    isPendingGameVotes
  )
    return <Loader />;
  if (!event || event.data.data.active !== true)
    return <div>Tapahtumaa ei löytynyt</div>;
  if (event.data.data.votingState !== 2 && event.data.data.votingState !== 3)
    return <div>Äänestys ei ole avoinna</div>;
  if (!games || !votesData) return <div>Tapahtumaa ei löytynyt</div>;

  const participation = participations?.data.data.find(
    (p: { userId: number }) => p.userId === user?.data.id,
  );

  return (
    <>
      <Title order={2}>Peliäänestys - {event.data.data.title}</Title>
      <Group>
        {participation ? (
          <Text>
            Voit antaa yhteensä {maxVotes} ääntä. Pelit esitetään
            sattumanvaraisessa järjestyksessä.
          </Text>
        ) : (
          <Text>
            Voit äänestää ilmoittautumisen jälkeen. Pelit esitetään
            sattumanvaraisessa järjestyksessä.
          </Text>
        )}
        <TextInput
          placeholder="Hae peliä"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Group>
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }} mt="xs">
        {gamesToVoteRandomized.map(
          (game: GameVote | z.infer<typeof gameSchema>) => {
            const submitter = users?.data.find(
              (u: z.infer<typeof userSchema>) => u.id === game.submittedBy,
            );
            return (
              <Card
                key={game.id}
                shadow="md"
                radius="md"
                withBorder
                p="xs"
                display="flex"
              >
                <Group wrap="nowrap">
                  <Image src={game.image} h={100} w="auto" alt={game.title} />
                  <Spoiler
                    maxHeight={110}
                    showLabel="Näytä lisää"
                    hideLabel="Piilota"
                  >
                    <Title order={4}>{game.title}</Title>
                  </Spoiler>
                </Group>
                <Group mt="xs">
                  {getLink(game.link, game.store)}
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
                <Group justify="space-between" mt="xs">
                  <Spoiler
                    maxHeight={isMobile ? 41 : undefined}
                    showLabel="Näytä lisää"
                    hideLabel="Piilota"
                  >
                    <Text c="dimmed" size="sm">
                      {game.description}
                    </Text>
                  </Spoiler>
                  <Tooltip
                    label={submitter?.nickname || submitter?.username}
                    position="top"
                    events={{ hover: true, focus: true, touch: true }}
                    withArrow
                  >
                    <Avatar
                      src={`https://cdn.discordapp.com/avatars/${submitter.snowflake}/${submitter.avatar}.png`}
                      size="sm"
                      radius="xl"
                      alt={submitter.nickname || submitter.username}
                    >
                      <Avatar
                        src="https://cdn.discordapp.com/embed/avatars/0.png"
                        size="sm"
                        radius="xl"
                        alt={submitter.nickname || submitter.username}
                      />
                    </Avatar>
                  </Tooltip>
                </Group>
                <Group mt="xs" w="100%" h="100%" align="flex-end">
                  {votes.find(
                    (vote: { externalApiId: number }) =>
                      vote.externalApiId === game.externalApiId,
                  ) ? (
                    <VoteButton
                      onClick={() => {
                        deleteVote.mutate(
                          votes.find(
                            (vote: { externalApiId: number }) =>
                              vote.externalApiId === game.externalApiId,
                          ).id,
                          {
                            onSuccess: () => {
                              notifications.show({
                                title: "Ääni poistettu",
                                message: `Voit antaa vielä ${maxVotes - votes.length + 1} ääntä`,
                                color: "green",
                              });
                            },
                          },
                        );
                      }}
                      disabled={!participation}
                      isVoted
                    />
                  ) : (
                    <VoteButton
                      onClick={() => {
                        addVote.mutate(
                          {
                            eventId,
                            externalApiId: game.externalApiId,
                          },
                          {
                            onSuccess: () => {
                              notifications.show({
                                title: "Ääni lisätty",
                                message: `Voit antaa vielä ${maxVotes - votes.length - 1} ääntä`,
                                color: "green",
                              });
                            },
                          },
                        );
                      }}
                      disabled={votes.length >= maxVotes || !participation}
                      isVoted={false}
                    />
                  )}
                </Group>
              </Card>
            );
          },
        )}
      </SimpleGrid>
    </>
  );
}
