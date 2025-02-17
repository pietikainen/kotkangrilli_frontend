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
import React, { useEffect, useState } from "react";
import { z } from "zod";
import useAddVote from "../../../api/useAddVote.hook";
import useDeleteVote from "../../../api/useDeleteVote.hook";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetGames from "../../../api/useGetGames.hook";
import useGetParticipationsByEventId from "../../../api/useGetParticipationsByEventId.hook";
import useGetUser from "../../../api/useGetUser.hook";
import useGetUserProfiles from "../../../api/useGetUserProfiles.hook";
import useGetVotes from "../../../api/useGetVotes.hook";
import VoteButton from "../../../components/VoteButton";
import userSchema from "../../../schemas/userSchema";
import { getLink } from "../../../utils/getLink";

function shuffleArray(array: never[]) {
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
  const { data: votes, isPending: isPendingVotes } = useGetVotes(eventId);
  const { data: participations, isPending: isPendingParticipations } =
    useGetParticipationsByEventId(eventId);
  const { data: users, isPending: isPendingUsers } = useGetUserProfiles();

  const addVote = useAddVote();
  const deleteVote = useDeleteVote();

  const isMobile = useMediaQuery("(max-width: 50em)");
  const [gamesToVoteRandomized, setGamesToVoteRandomized] = useState<
    {
      id: number;
      externalApiId: number;
      title: string;
      image: string;
      link: string;
      isLan: boolean;
      price: number;
      description: string;
      store: string;
      players: number;
      submittedBy: number;
    }[]
  >([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    if (!games || !votes) return;
    const gamesToVote = games.data.data.filter(
      (game: { externalApiId: number }) =>
        !votes.data.data.find(
          (vote: { externalApiId: number }) =>
            vote.externalApiId === game.externalApiId,
        ),
    );
    const alreadyVotedGames = games.data.data.filter(
      (game: { externalApiId: number }) =>
        votes.data.data.find(
          (vote: { externalApiId: number }) =>
            vote.externalApiId === game.externalApiId,
        ),
    );
    const filteredGames = gamesToVote.filter((game: { title: string }) =>
      game.title.toLowerCase().includes(filter.toLowerCase()),
    );
    shuffleArray(filteredGames);
    const newGamesToVoteRandomized = [...alreadyVotedGames, ...filteredGames];
    setGamesToVoteRandomized(newGamesToVoteRandomized);
  }, [games, votes, filter]);

  if (
    isPending ||
    isPendingGames ||
    isPendingVotes ||
    isPendingParticipations ||
    isPendingUsers
  )
    return <Loader />;
  if (!event || event.data.data.active !== true)
    return <div>Tapahtumaa ei löytynyt</div>;
  if (event.data.data.votingState !== 2 && event.data.data.votingState !== 3)
    return <div>Äänestys ei ole avoinna</div>;
  if (!games || !votes) return <div>Tapahtumaa ei löytynyt</div>;

  const participation = participations?.data.data.find(
    (p: { userId: number }) => p.userId === user?.data.id,
  );

  return (
    <>
      <Title order={2}>Peliäänestys - {event.data.data.title}</Title>
      <Group>
        {participation ? (
          <Text>
            Voit antaa yhteensä {event.data.data.winnerGamesCount} ääntä. Pelit
            esitetään sattumanvaraisessa järjestyksessä.
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
          (game: {
            id: number;
            externalApiId: number;
            title: string;
            image: string;
            link: string;
            isLan: boolean;
            price: number;
            description: string;
            store: string;
            players: number;
            submittedBy: number;
          }) => {
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
                    label={submitter?.username}
                    position="top"
                    events={{ hover: true, focus: true, touch: true }}
                    withArrow
                  >
                    <Avatar
                      src={`https://cdn.discordapp.com/avatars/${submitter.snowflake}/${submitter.avatar}.png`}
                      size="sm"
                      radius="xl"
                      alt={submitter.username}
                    />
                  </Tooltip>
                </Group>
                <Group mt="xs" w="100%" h="100%" align="flex-end">
                  {votes.data.data.find(
                    (vote: { externalApiId: number }) =>
                      vote.externalApiId === game.externalApiId,
                  ) ? (
                    <VoteButton
                      onClick={() => {
                        deleteVote.mutate(
                          votes.data.data.find(
                            (vote: { externalApiId: number }) =>
                              vote.externalApiId === game.externalApiId,
                          ).id,
                          {
                            onSuccess: () => {
                              notifications.show({
                                title: "Ääni poistettu",
                                message: `Voit antaa vielä ${event.data.data.winnerGamesCount - votes.data.data.length + 1} ääntä`,
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
                                message: `Voit antaa vielä ${event.data.data.winnerGamesCount - votes.data.data.length - 1} ääntä`,
                                color: "green",
                              });
                            },
                          },
                        );
                      }}
                      disabled={
                        votes.data.data.length >=
                          event.data.data.winnerGamesCount || !participation
                      }
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
