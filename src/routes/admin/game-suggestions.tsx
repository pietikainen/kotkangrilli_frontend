import {
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import useDeleteGame from "../../api/useDeleteGame.hook";
import useGetGames from "../../api/useGetGames.hook";
import useGetUsers from "../../api/useGetUsers.hook";
import GameForm from "../../components/forms/GameForm";
import AdminGameTable from "../../components/tables/AdminGameTable";
import gameSchema from "../../schemas/gameSchema";

export const Route = createFileRoute("/admin/game-suggestions")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: games, isLoading } = useGetGames();
  const { data: users, isLoading: isUsersLoading } = useGetUsers();
  const [game, setGame] = useState<z.infer<typeof gameSchema>>();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const deleteGame = useDeleteGame();

  useEffect(() => {
    if (!opened && !deleteOpened) {
      setGame(undefined);
    }
  }, [opened, deleteOpened]);

  function onEdit(row: z.infer<typeof gameSchema>) {
    setGame(row);
    open();
  }

  function onDelete(row: z.infer<typeof gameSchema>) {
    setGame(row);
    openDelete();
  }

  async function onSubmitDelete(gameId: number | undefined) {
    if (!gameId) {
      notifications.show({
        title: "Peliehdotusta ei voitu poistaa",
        message: "Pyynnöltä puuttui ID",
        color: "red",
      });
    } else {
      deleteGame.mutate(gameId, {
        onSuccess: () => {
          notifications.show({
            title: "Peliehdotus poistettu",
            message: "Peliehdotus on poistettu onnistuneesti",
            color: "green",
          });
          closeDelete();
        },
        onError: () => {
          notifications.show({
            title: "Virhe",
            message: "Tapahtumaa ei voitu poistaa",
            color: "red",
          });
        },
      });
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Peliehdotukset</Title>
      </Group>
      {isLoading || isUsersLoading ? (
        <Loader />
      ) : (
        <AdminGameTable
          data={games?.data.data}
          users={users?.data}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
      {game && (
        <Modal opened={opened} onClose={close} title={`Muokkaa: ${game.title}`}>
          <GameForm close={close} game={game} />
        </Modal>
      )}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Poista peliehdotus"
      >
        <Text>Haluatko varmasti poistaa peliehdotuksen?</Text>
        <h3>{game?.title}</h3>
        <Group>
          <Button onClick={closeDelete}>Peruuta</Button>
          <Button color="red" onClick={() => onSubmitDelete(game?.id)}>
            Poista
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
