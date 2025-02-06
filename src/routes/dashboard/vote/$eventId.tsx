import {
  ActionIcon,
  AspectRatio,
  Badge,
  Button,
  Flex,
  Group,
  HoverCard,
  Image,
  Loader,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceGamepad, IconInfoSmall } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import useAddVote from "../../../api/useAddVote.hook";
import useDeleteVote from "../../../api/useDeleteVote.hook";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetGames from "../../../api/useGetGames.hook";
import useGetParticipationsByEventId from "../../../api/useGetParticipationsByEventId.hook";
import useGetUser from "../../../api/useGetUser.hook";
import useGetVotes from "../../../api/useGetVotes.hook";
import { getLink } from "../../../utils/getLink";

type FontSizeRecord = Record<number, "xs" | "sm" | "md" | "lg" | "xl">;

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
  const { data: event, isLoading } = useGetEvent(eventId);
  const { data: games, isLoading: isLoadingGames } = useGetGames();
  const { data: votes, isLoading: isLoadingVotes } = useGetVotes(eventId);
  const { data: participations, isLoading: isLoadingParticipations } =
    useGetParticipationsByEventId(eventId);

  const addVote = useAddVote();
  const deleteVote = useDeleteVote();

  const [fontSizes, setFontSizes] = useState<FontSizeRecord>({});
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
    }[]
  >([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const newFontSizes: FontSizeRecord = {};
    gamesToVoteRandomized.forEach((game: { id: number; title: string }) => {
      const { length } = game.title;
      if (length <= 20) newFontSizes[game.id] = "xl";
      else if (length <= 30) newFontSizes[game.id] = "lg";
      else if (length <= 40) newFontSizes[game.id] = "md";
      else newFontSizes[game.id] = "sm";
    });
    setFontSizes(newFontSizes);
  }, [gamesToVoteRandomized]);

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

  if (isLoading || isLoadingGames || isLoadingVotes || isLoadingParticipations)
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
      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
          lg: 5,
        }}
        spacing={{
          base: 5,
          sm: "md",
        }}
        verticalSpacing={{
          base: "5",
          sm: "md",
        }}
      >
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
                  <Image src={game.image} alt={game.title} />
                </AspectRatio>
                <Text size={fontSizes[game.id] || "md"}>{game.title}</Text>
              </Flex>
              <Group mb={5}>
                {getLink(game.link, game.store)}
                {game.isLan && (
                  <Badge color="blue" radius="sm">
                    LAN
                  </Badge>
                )}
                {game.store === "NAS" ? (
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

              {votes.data.data.find(
                (vote: { externalApiId: number }) =>
                  vote.externalApiId === game.externalApiId,
              ) ? (
                <Button
                  onClick={() => {
                    deleteVote.mutate(
                      votes.data.data.find(
                        (vote: { externalApiId: number }) =>
                          vote.externalApiId === game.externalApiId,
                      ).id,
                    );
                  }}
                  color="red"
                  disabled={!participation}
                >
                  Poista ääni
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    addVote.mutate(
                      {
                        eventId,
                        externalApiId: game.externalApiId,
                      },
                      {
                        onSuccess: () => {
                          notifications.show({
                            message: "Ääni lisätty",
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
                >
                  Äänestä
                </Button>
              )}
            </Paper>
          ),
        )}
      </SimpleGrid>
    </>
  );
}
