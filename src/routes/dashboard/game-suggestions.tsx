import {
  Anchor,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { IconPhotoOff } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import useGetEvents from "../../api/useGetEvents.hook";
import useGetGames from "../../api/useGetGames.hook";
import useGetGamesSearch from "../../api/useGetGamesSearch.hook";
import useGetUserProfiles from "../../api/useGetUserProfiles.hook";
import GameForm from "../../components/forms/GameForm";
import GameSuggestionsList from "../../components/GameSuggestionList";

export const Route = createFileRoute("/dashboard/game-suggestions")({
  component: RouteComponent,
});

function RouteComponent() {
  const [openedMenu, setOpenedMenu] = useState(false);
  const [title, setTitle] = useState("");
  const [debounced] = useDebouncedValue(title, 2000);
  const [foundGames, setFoundGames] = useState<
    { id: number; coverImageUrl: string; name: string }[]
  >([]);
  const [isLoadingCovers, setIsLoadingCovers] = useState(false);
  const [game, setGame] = useState<{
    id: number;
    coverImageUrl: string;
    name: string;
  } | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { data, isLoading } = useGetGames();
  const { data: upData, isLoading: isLoadingUserProfiles } =
    useGetUserProfiles();
  const {
    data: gamesSearchData,
    isFetching: isFetchingGamesSearch,
    isSuccess: isSuccessGamesSearch,
  } = useGetGamesSearch(debounced);
  const { data: events, isLoading: isLoadingEvents } = useGetEvents();

  useEffect(() => {
    if (!debounced || title !== debounced) return;

    const controller = new AbortController();
    async function fetchCoverImages() {
      if (isSuccessGamesSearch && gamesSearchData.data.data) {
        setIsLoadingCovers(true);
        const gamesWithCovers = await Promise.all(
          gamesSearchData.data.data.map(
            async (foundGame: {
              id: number;
              coverImageUrl: string;
              name: string;
            }) => {
              try {
                const response = await axios.get(
                  `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/games/cover/${foundGame.id}`,
                  {
                    withCredentials: true,
                    signal: controller.signal,
                  },
                );
                return {
                  ...foundGame,
                  coverImageUrl:
                    response.status === 200 ? response.data.data : null,
                };
              } catch {
                return { ...foundGame, coverImageUrl: null };
              }
            },
          ),
        );
        if (controller.signal.aborted) return;
        setFoundGames(gamesWithCovers);
        setIsLoadingCovers(false);
        setOpenedMenu(true);
      }
    }

    fetchCoverImages();
    return () => controller.abort();
  }, [isSuccessGamesSearch, gamesSearchData, title, debounced]);

  function changeTitle(value: string) {
    setTitle(value);
    setIsLoadingCovers(false);
    if (value === "") {
      setOpenedMenu(false);
      setFoundGames([]);
    }
  }

  const games = data?.data.data || [];
  const userProfiles = upData?.data || [];

  if (isLoadingEvents) return <Loader />;

  const activeEvent = events?.data.data.find(
    (event: { active: boolean; votingState: number; endDate: Date }) =>
      event.active && event.votingState > 0 && dayjs().isBefore(event.endDate),
  );

  if (activeEvent) {
    return (
      <div>
        Äänestys on avoinna eikä peliehdotuksia voi lisätä.{" "}
        <Anchor component={Link} to={`/dashboard/vote/${activeEvent.id}`}>
          Siirry äänestyssivulle
        </Anchor>
      </div>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Peliehdotukset</Title>
        <Group>
          {(isFetchingGamesSearch || isLoadingCovers) && <Loader />}
          <Menu
            opened={openedMenu && title !== ""}
            onChange={setOpenedMenu}
            trigger="click-hover"
          >
            <Menu.Target>
              <TextInput
                placeholder="Ehdota peliä..."
                value={title}
                onChange={(e) => changeTitle(e.currentTarget.value)}
              />
            </Menu.Target>
            <Menu.Dropdown>
              {foundGames && foundGames.length > 0 ? (
                foundGames.map(
                  (foundGame: {
                    id: number;
                    coverImageUrl: string;
                    name: string;
                  }) => (
                    <div key={foundGame.id}>
                      <Menu.Item
                        key={foundGame.id}
                        leftSection={
                          foundGame.coverImageUrl ? (
                            <Image
                              src={foundGame.coverImageUrl}
                              alt="Kansikuva"
                              w="auto"
                              mah={64}
                            />
                          ) : (
                            <IconPhotoOff />
                          )
                        }
                        onClick={() => {
                          setGame(foundGame);
                          open();
                        }}
                      >
                        {foundGame.name}
                      </Menu.Item>
                    </div>
                  ),
                )
              ) : (
                <Menu.Item>
                  {title && !isFetchingGamesSearch && !isLoadingCovers
                    ? "Haku ei tuottanut tuloksia"
                    : "Etsi peliä nimellä"}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <Text>
        Pelin kauppa ilmoitetaan aina virallisella kaupalla, mutta hinta voi
        olla myös virallisilta tai epävirallisilta jälleenmyyjiltä.
        <br />
        Hinnan löytämiseen voit käyttää{" "}
        <Anchor href="https://isthereanydeal.com/" target="_blank">
          IsThereAnyDeal
        </Anchor>
        (vain virallisia),{" "}
        <Anchor href="https://gg.deals/" target="_blank">
          GG.deals
        </Anchor>
        (erottelee viralliset) tai{" "}
        <Anchor href="https://www.allkeyshop.com/blog/" target="_blank">
          AllKeyShop
        </Anchor>{" "}
        sivustoa.
      </Text>
      {isLoading || isLoadingUserProfiles ? (
        <Loader />
      ) : (
        <GameSuggestionsList games={games} userProfiles={userProfiles} />
      )}
      {game && (
        <Modal opened={opened} onClose={close} title={game.name}>
          <GameForm searchedGame={game} close={close} setTitle={changeTitle} />
        </Modal>
      )}
    </Stack>
  );
}
