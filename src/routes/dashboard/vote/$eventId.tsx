import {
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Spoiler,
  Stack,
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
import React, { useCallback, useMemo, useState } from "react";
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
  voteGroup?: string;
  pendingReason?: string | null;
  votes_amount: number;
  is_winner: boolean;
  finalized: boolean;
}

interface VoteCandidate extends Omit<GameVote, "id" | "submittedBy"> {
  id: string;
  submittedBy?: number;
  memberTitles: string[];
  memberExternalApiIds: number[];
  representativeExternalApiId: number;
  displayTitle: string;
}

function shuffleArray(array: VoteCandidate[]) {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getCurrentGameVotes(gameVotes: GameVote[]) {
  const latestVotesByGame = new Map<number, GameVote>();

  gameVotes.forEach((gameVote) => {
    const existingVote = latestVotesByGame.get(gameVote.externalApiId);

    if (!existingVote || gameVote.voting_round > existingVote.voting_round) {
      latestVotesByGame.set(gameVote.externalApiId, gameVote);
    }
  });

  return [...latestVotesByGame.values()];
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
    return (
      Math.max(
        ...gameVotes.data.data.map(
          (roundVote: { voting_round: number }) => roundVote.voting_round,
        ),
      ) + 1
    );
  }, [gameVotes]);

  const currentGameVotes = useMemo(
    () => getCurrentGameVotes(gameVotes?.data?.data ?? []),
    [gameVotes],
  );

  const unresolvedVotes = useMemo(() => {
    return currentGameVotes.filter(
      (game: GameVote) => game.is_winner && !game.finalized,
    );
  }, [currentGameVotes]);

  const votingPhase = useMemo<"normal" | "group_decider">(() => {
    if (
      unresolvedVotes.some(
        (game: GameVote) => game.pendingReason === "cutoff_tie",
      )
    ) {
      return "normal";
    }

    if (
      unresolvedVotes.some(
        (game: GameVote) => game.pendingReason === "group_member_decider",
      )
    ) {
      return "group_decider";
    }

    return "normal";
  }, [unresolvedVotes]);

  const maxVotes = React.useMemo(() => {
    if (!event?.data?.data) return 0;
    const finalizedGames =
      currentGameVotes.filter(
        (game: { finalized: boolean }) => game.finalized,
      ) ?? [];
    const reservedGroupSlots = new Set(
      unresolvedVotes
        .filter(
          (game: GameVote) => game.pendingReason === "group_member_decider",
        )
        .map((game: GameVote) => game.voteGroup)
        .filter(Boolean),
    ).size;

    if (votingPhase === "group_decider") {
      return reservedGroupSlots;
    }

    return (
      event.data.data.winnerGamesCount -
      finalizedGames.length -
      reservedGroupSlots
    );
  }, [currentGameVotes, event, unresolvedVotes, votingPhase]);

  const votes = votesData?.data.data.filter(
    (vote: { voting_round: number }) => vote.voting_round === votingRound,
  );

  const getVoteGroupForExternalApiId = useCallback(
    (externalApiId: number) => {
      const currentRoundGame = unresolvedVotes.find(
        (game: GameVote) => game.externalApiId === externalApiId,
      );

      if (currentRoundGame?.voteGroup) {
        return currentRoundGame.voteGroup.trim();
      }

      const originalGame = games?.data.data.find(
        (candidate: { externalApiId: number; voteGroup?: string }) =>
          candidate.externalApiId === externalApiId,
      );

      return originalGame?.voteGroup?.trim();
    },
    [games, unresolvedVotes],
  );

  const voteCandidates = useMemo<VoteCandidate[]>(() => {
    if (!games || !gameVotes) return [];

    if (votingPhase === "group_decider") {
      return unresolvedVotes
        .filter(
          (game: GameVote) => game.pendingReason === "group_member_decider",
        )
        .map((game: GameVote) => ({
          ...game,
          id: `game-${game.externalApiId}`,
          memberTitles: [game.title],
          memberExternalApiIds: [game.externalApiId],
          representativeExternalApiId: game.externalApiId,
          displayTitle: game.title,
        }));
    }

    if (votingRound > 1) {
      const groupedCandidates = new Map<string, VoteCandidate>();
      const ungroupedCandidates: VoteCandidate[] = [];

      unresolvedVotes
        .filter((game: GameVote) => game.pendingReason === "cutoff_tie")
        .forEach((game: GameVote) => {
          const voteGroup = game.voteGroup?.trim();

          if (!voteGroup) {
            ungroupedCandidates.push({
              ...game,
              id: `game-${game.externalApiId}`,
              memberTitles: [game.title],
              memberExternalApiIds: [game.externalApiId],
              representativeExternalApiId: game.externalApiId,
              displayTitle: game.title,
            });
            return;
          }

          const existingCandidate = groupedCandidates.get(voteGroup);

          if (existingCandidate) {
            existingCandidate.memberTitles.push(game.title);
            existingCandidate.memberExternalApiIds.push(game.externalApiId);
            return;
          }

          groupedCandidates.set(voteGroup, {
            ...game,
            id: `group-${voteGroup}`,
            memberTitles: [game.title],
            memberExternalApiIds: [game.externalApiId],
            representativeExternalApiId: game.externalApiId,
            displayTitle: game.title,
          });
        });

      return [
        ...ungroupedCandidates,
        ...[...groupedCandidates.values()].map((candidate) => ({
          ...candidate,
          description: `Mukana: ${candidate.memberTitles.join(", ")}`,
          displayTitle: candidate.memberTitles.join(" / "),
        })),
      ];
    }

    const groupedCandidates = new Map<string, VoteCandidate>();
    const ungroupedCandidates: VoteCandidate[] = [];

    games.data.data.forEach((game: z.infer<typeof gameSchema>) => {
      const voteGroup = game.voteGroup?.trim();

      if (!voteGroup) {
        ungroupedCandidates.push({
          ...game,
          id: `game-${game.externalApiId}`,
          image: game.image || "",
          description: game.description || "",
          eventId,
          voting_round: votingRound,
          votes_amount: 0,
          is_winner: false,
          finalized: false,
          memberTitles: [game.title],
          memberExternalApiIds: [game.externalApiId],
          representativeExternalApiId: game.externalApiId,
          displayTitle: game.title,
        });
        return;
      }

      const existingCandidate = groupedCandidates.get(voteGroup);

      if (existingCandidate) {
        existingCandidate.memberTitles.push(game.title);
        return;
      }

      groupedCandidates.set(voteGroup, {
        ...game,
        id: `group-${voteGroup}`,
        image: game.image || "",
        eventId,
        voting_round: votingRound,
        votes_amount: 0,
        is_winner: false,
        finalized: false,
        title: voteGroup,
        description: `Ryhmään kuuluvat: ${game.title}`,
        memberTitles: [game.title],
        memberExternalApiIds: [game.externalApiId],
        representativeExternalApiId: game.externalApiId,
        displayTitle: game.title,
      });
    });

    return [
      ...ungroupedCandidates,
      ...[...groupedCandidates.values()].map((candidate) => ({
        ...candidate,
        description: `Ryhmään kuuluvat: ${candidate.memberTitles.join(", ")}`,
        displayTitle: candidate.memberTitles.join(" / "),
      })),
    ];
  }, [eventId, games, gameVotes, votingRound, votingPhase, unresolvedVotes]);

  const gamesToVoteRandomized = useMemo(() => {
    if (!votes) return [];

    const findVoteForCandidate = (game: VoteCandidate) => {
      if (game.voteGroup && votingPhase === "normal") {
        return votes.find(
          (vote: { id: number; externalApiId: number }) =>
            getVoteGroupForExternalApiId(vote.externalApiId) === game.voteGroup,
        );
      }

      return votes.find(
        (vote: { id: number; externalApiId: number }) =>
          vote.externalApiId === game.externalApiId,
      );
    };

    const alreadyVotedGames = voteCandidates.filter((game) =>
      Boolean(findVoteForCandidate(game)),
    );

    const gamesToVote = voteCandidates.filter(
      (game) => !findVoteForCandidate(game),
    );

    const filteredGames = gamesToVote.filter((game) =>
      `${game.title} ${game.memberTitles.join(" ")}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
    );
    if (votingPhase === "normal") {
      shuffleArray(filteredGames);
    }
    return [...alreadyVotedGames, ...filteredGames];
  }, [
    getVoteGroupForExternalApiId,
    voteCandidates,
    votes,
    filter,
    votingPhase,
  ]);

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
        {gamesToVoteRandomized.map((game: VoteCandidate) => {
          const submitter = users?.data.find(
            (u: z.infer<typeof userSchema>) => u.id === game.submittedBy,
          );
          const hasVoteInSameGroup =
            votingPhase === "group_decider" &&
            Boolean(game.voteGroup) &&
            votes.some(
              (vote: { id: number; externalApiId: number }) =>
                getVoteGroupForExternalApiId(vote.externalApiId) ===
                game.voteGroup,
            );
          const votedItem =
            game.voteGroup && votingPhase === "normal"
              ? votes.find((vote: { id: number; externalApiId: number }) => {
                  const unresolvedGame = unresolvedVotes.find(
                    (candidate: GameVote) =>
                      candidate.externalApiId === vote.externalApiId,
                  );
                  const originalGame = games.data.data.find(
                    (candidate: {
                      externalApiId: number;
                      voteGroup?: string;
                    }) => candidate.externalApiId === vote.externalApiId,
                  );

                  return (
                    unresolvedGame?.voteGroup?.trim() === game.voteGroup ||
                    originalGame?.voteGroup?.trim() === game.voteGroup
                  );
                })
              : votes.find(
                  (vote: { id: number; externalApiId: number }) =>
                    vote.externalApiId === game.externalApiId,
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
                  <Title order={4}>{game.displayTitle}</Title>
                </Spoiler>
              </Group>
              <Stack gap={4} mt="xs">
                <Group gap={4}>
                  {game.voteGroup && votingPhase === "normal" && (
                    <Badge color="blue">Yhteisäänestys</Badge>
                  )}
                  {game.voteGroup && votingPhase === "group_decider" && (
                    <Badge color="indigo">{game.voteGroup}</Badge>
                  )}
                  {getLink(game.link, game.store)}
                </Group>
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
              </Stack>
              <Spoiler
                mt="xs"
                mb="xs"
                maxHeight={isMobile ? 41 : undefined}
                showLabel="Näytä lisää"
                hideLabel="Piilota"
              >
                <Text c="dimmed" size="sm">
                  {game.voteGroup && votingPhase === "normal"
                    ? `Mukana: ${game.memberTitles.join(", ")}`
                    : game.description}
                </Text>
              </Spoiler>
              <Group
                mt="auto"
                pt="xs"
                w="100%"
                justify="space-between"
                wrap="nowrap"
              >
                {votedItem ? (
                  <VoteButton
                    onClick={() => {
                      deleteVote.mutate(votedItem.id, {
                        onSuccess: () => {
                          notifications.show({
                            title: "Ääni poistettu",
                            message: `Voit antaa vielä ${maxVotes - votes.length + 1} ääntä`,
                            color: "green",
                          });
                        },
                      });
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
                          externalApiId: game.representativeExternalApiId,
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
                    disabled={
                      votes.length >= maxVotes ||
                      !participation ||
                      Boolean(hasVoteInSameGroup)
                    }
                    isVoted={false}
                  />
                )}
                {submitter && (
                  <Tooltip
                    label={submitter.nickname || submitter.username}
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
                )}
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
}
