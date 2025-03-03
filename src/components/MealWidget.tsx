import {
  Badge,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCurrencyEuro, IconCurrencyEuroOff } from "@tabler/icons-react";
import React from "react";
import { z } from "zod";
import useAddEater from "../api/useAddEater.hook";
import useDeleteEater from "../api/useDeleteEater.hook";
import useDeleteMeal from "../api/useDeleteMeal.hook";
import useGetEaters from "../api/useGetEaters.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdateEaterPaid from "../api/useUpdateEaterPaid.hook";
import MealForm from "../components/forms/MealForm";
import mealSchema from "../schemas/mealSchema";
import participationSchema from "../schemas/participationSchema";

export default function MealWidget({
  meal,
  participation,
}: {
  meal: z.infer<typeof mealSchema>;
  participation?: z.infer<typeof participationSchema>;
}) {
  const { data: user } = useGetUser();
  const { data: eaters, isLoading: isLoadingEaters } = useGetEaters(meal.id);
  const { data: users, isLoading: isLoadingUsers } = useGetUserProfiles();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");

  const addEater = useAddEater();
  const deleteEater = useDeleteEater();
  const deleteMeal = useDeleteMeal();
  const updateEaterPaid = useUpdateEaterPaid();

  if (isLoadingEaters || isLoadingUsers) return <Loader />;

  const chef = users?.data.find((u: { id: number }) => u.id === meal.chefId);
  const isChef = meal.chefId === user?.data.id;
  const eater = eaters?.data.data.find(
    (e: { eaterId: number }) => e.eaterId === user?.data.id,
  );

  return (
    <div>
      <Stack>
        <Group>
          <Title order={3}>{meal.name}</Title>à la{" "}
          <>
            {chef?.avatar ? (
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  chef?.snowflake
                }/${chef?.avatar}.png?size=32`}
                fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            ) : (
              <Image
                src="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            )}
            {chef?.username}
          </>
        </Group>
        {meal.description && <Text>{meal.description}</Text>}
        <Group>
          <Text>Hinta: {meal.price / 100} €</Text>
          {meal.mobilepay && <Badge color="indigo">MobilePay</Badge>}
          {meal.banktransfer && <Badge color="teal">Tilisiirto</Badge>}
        </Group>
        <Text>Syöjiä: {eaters?.data.data.length}</Text>
        <SimpleGrid spacing="xs" cols={2}>
          {eaters?.data.data.map(
            (e: { id: number; eaterId: number; paid: number }) => {
              const eaterUser = users?.data.find(
                (u: { id: number }) => u.id === e.eaterId,
              );
              return (
                <div key={e.id}>
                  <Group>
                    {eaterUser?.avatar ? (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${eaterUser.snowflake}/${eaterUser.avatar}.png?size=16`}
                        fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                        alt={`${eaterUser.username} avatar`}
                        mah={16}
                        w="auto"
                        fit="contain"
                      />
                    ) : (
                      <Image
                        src="https://cdn.discordapp.com/embed/avatars/0.png"
                        alt={`${eaterUser.username} avatar`}
                        mah={16}
                        w="auto"
                        fit="contain"
                      />
                    )}
                    {eaterUser?.username}

                    {e.paid === 0 && (
                      <ThemeIcon size="sm" color="red">
                        <IconCurrencyEuroOff />
                      </ThemeIcon>
                    )}

                    {e.paid === 1 && (
                      <ThemeIcon size="sm" color="yellow">
                        <IconCurrencyEuro />
                      </ThemeIcon>
                    )}

                    {e.paid === 2 && (
                      <ThemeIcon size="sm" color="green">
                        <IconCurrencyEuro />
                      </ThemeIcon>
                    )}

                    {isChef && (
                      <>
                        {e.paid === 0 && (
                          <Button
                            size="xs"
                            variant="outline"
                            color="red"
                            onClick={() =>
                              deleteEater.mutate({
                                id: e.id,
                              })
                            }
                            disabled={!e.id}
                          >
                            Poista syöjä
                          </Button>
                        )}
                        {e.paid < 2 && (
                          <Button
                            size="xs"
                            variant="outline"
                            color="green"
                            onClick={() =>
                              updateEaterPaid.mutate(
                                {
                                  id: e.id,
                                  paidLevel: 2,
                                },
                                {
                                  onSuccess: () => {
                                    notifications.show({
                                      title: "Maksettu",
                                      message: "Syöjä merkattu maksetuksi",
                                      color: "green",
                                    });
                                  },
                                },
                              )
                            }
                            disabled={!e.id}
                          >
                            Merkkaa maksu
                          </Button>
                        )}
                        {e.paid > 0 && (
                          <Button
                            size="xs"
                            variant="outline"
                            color="red"
                            onClick={() =>
                              updateEaterPaid.mutate(
                                {
                                  id: e.id,
                                  paidLevel: 0,
                                },
                                {
                                  onSuccess: () => {
                                    notifications.show({
                                      title: "Maksu poistettu",
                                      message: "Syöjä merkattu maksamattomaksi",
                                      color: "green",
                                    });
                                  },
                                },
                              )
                            }
                            disabled={!e.id}
                          >
                            Poista maksu
                          </Button>
                        )}
                      </>
                    )}
                  </Group>
                </div>
              );
            },
          )}
        </SimpleGrid>
      </Stack>
      <Group mt={40}>
        {eater ? (
          <>
            {eater.paid === 0 && (
              <>
                <Button
                  onClick={() => deleteEater.mutate({ id: eater.id })}
                  color="red"
                  disabled={!participation || !eater.id}
                >
                  Poista ilmoittautuminen
                </Button>
                <Button
                  onClick={() =>
                    updateEaterPaid.mutate({
                      id: eater.id,
                      paidLevel: 1,
                    })
                  }
                  disabled={!eater.id}
                >
                  Merkitse maksetuksi
                </Button>
              </>
            )}
            {eater.paid === 1 && (
              <Button
                onClick={() =>
                  updateEaterPaid.mutate({
                    id: eater.id,
                    paidLevel: 0,
                  })
                }
                color="orange"
                disabled={!eater.id}
              >
                Merkitse maksamattomaksi
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={() => meal.id && addEater.mutate(meal.id)}
            disabled={!participation || !meal.id}
          >
            Ilmoittaudu syöjäksi
          </Button>
        )}
        {isChef && (
          <>
            <Button onClick={open} disabled={!participation}>
              Muokkaa
            </Button>
            <Button onClick={openDelete} disabled={!participation}>
              Poista
            </Button>
          </>
        )}
      </Group>
      <Modal
        opened={opened}
        onClose={close}
        title="Muokkaa ateriaa"
        fullScreen={isMobile}
      >
        <MealForm meal={meal} close={close} />
      </Modal>
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Poista ateria"
        fullScreen={isMobile}
      >
        <Text>Haluatko varmasti poistaa aterian?</Text>
        <Title order={3}>{meal.name}</Title>
        <Text>Syöjiä: {eaters?.data.data.length}</Text>
        {eaters?.data.data.length && (
          <Text>
            Poistaminen ei ainakaan vielä toimi jos syöjiä on jo ilmoittautunut.
            Ota yhteyttä ylläpitoon kiitos!
          </Text>
        )}
        <Group>
          <Button onClick={closeDelete}>Peruuta</Button>
          <Button
            color="red"
            onClick={() => meal.id && deleteMeal.mutate(meal.id)}
            disabled={eaters?.data.data.length > 0 || !meal.id}
          >
            Poista
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
