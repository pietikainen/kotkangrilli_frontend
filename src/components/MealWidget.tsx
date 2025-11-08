import {
  ActionIcon,
  Badge,
  Blockquote,
  Button,
  Group,
  Image,
  List,
  Loader,
  Modal,
  Popover,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCurrencyEuro,
  IconCurrencyEuroOff,
  IconInfoCircle,
  IconMessage,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React, { useState } from "react";
import { z } from "zod";
import useAddEater from "../api/useAddEater.hook";
import useDeleteEater from "../api/useDeleteEater.hook";
import useDeleteMeal from "../api/useDeleteMeal.hook";
import useGetEaters from "../api/useGetEaters.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdateEaterComment from "../api/useUpdateEaterComment.hook";
import useUpdateEaterPaid from "../api/useUpdateEaterPaid.hook";
import MealForm from "../components/forms/MealForm";
import eaterSchema from "../schemas/eaterSchema";
import mealSchema from "../schemas/mealSchema";
import participationSchema from "../schemas/participationSchema";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

const dayLabels = ["Torstai", "Perjantai", "Lauantai", "Sunnuntai"];

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
  const [commentOpened, { open: openComment, close: closeComment }] =
    useDisclosure(false);
  const [comment, setComment] = useState<string>("");
  const [isEditingComment, setIsEditingComment] = useState(false);
  const isMobile = useMediaQuery("(max-width: 50em)");

  const addEater = useAddEater();
  const deleteEater = useDeleteEater();
  const deleteMeal = useDeleteMeal();
  const updateEaterPaid = useUpdateEaterPaid();
  const updateEaterComment = useUpdateEaterComment();

  if (isLoadingEaters || isLoadingUsers) return <Loader />;

  const chef = users?.data.find((u: { id: number }) => u.id === meal.chefId);
  const isChef = meal.chefId === user?.data.id;
  const eater = eaters?.data.data.find(
    (e: z.infer<typeof eaterSchema>) => e.eaterId === user?.data.id,
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
                alt={`${chef?.nickname || chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            ) : (
              <Image
                src="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${chef?.nickname || chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            )}
            {chef?.nickname || chef?.username}
          </>
        </Group>
        <Group>
          {meal.days.map((d) => (
            <Badge key={d}>{dayLabels[d]}</Badge>
          ))}
        </Group>
        <Text>
          Ilmoittautuminen päättyy: {dayjs(meal.signupEnd).format("L LT")}
        </Text>
        {meal.description && <Text>{meal.description}</Text>}
        <Group>
          <Text>Hinta: {meal.price / 100} €</Text>
          {meal.mobilepay && <Badge color="indigo">MobilePay</Badge>}
          {meal.banktransfer && <Badge color="teal">Tilisiirto</Badge>}
        </Group>
        <Text>Syöjiä: {eaters?.data.data.length}</Text>
        <List
          type="ordered"
          style={{
            columnCount: 2,
          }}
        >
          {eaters?.data.data.map((e: z.infer<typeof eaterSchema>) => {
            const eaterUser = users?.data.find(
              (u: { id: number }) => u.id === e.eaterId,
            );
            return (
              <List.Item key={e.id}>
                <Group>
                  {eaterUser?.avatar ? (
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${eaterUser.snowflake}/${eaterUser.avatar}.png?size=16`}
                      fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${eaterUser.nickname || eaterUser.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  ) : (
                    <Image
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${eaterUser.nickname || eaterUser.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  )}
                  {eaterUser?.nickname || eaterUser?.username}

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

                  {e.comment && (
                    <Popover
                      width={200}
                      position="bottom"
                      withArrow
                      shadow="md"
                    >
                      <Popover.Target>
                        <ActionIcon size="sm">
                          <IconMessage />
                        </ActionIcon>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Text size="xs">{e.comment}</Text>
                      </Popover.Dropdown>
                    </Popover>
                  )}

                  {isChef && (
                    <>
                      {e.paid === 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() =>
                            e.id &&
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
                            e.id &&
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
                            e.id &&
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
              </List.Item>
            );
          })}
        </List>
      </Stack>
      <Group mt={40}>
        {eater ? (
          <>
            {eater.paid === 0 && (
              <>
                <Button
                  onClick={() => deleteEater.mutate({ id: eater.id })}
                  color="red"
                  disabled={
                    !participation ||
                    !eater.id ||
                    dayjs(meal.signupEnd) <= dayjs()
                  }
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingComment(true);
                    setComment(eater.comment ?? "");
                    openComment();
                  }}
                  disabled={dayjs(meal.signupEnd) <= dayjs()}
                >
                  Muokkaa kommenttia
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
            onClick={() => {
              setIsEditingComment(false);
              setComment("");
              openComment();
            }}
            disabled={
              !participation ||
              !meal.id ||
              (!isChef && dayjs(meal.signupEnd) <= dayjs())
            }
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
      <Modal
        opened={commentOpened}
        onClose={closeComment}
        title={isEditingComment ? "Muokkaa kommenttia" : "Ilmoittaudu syöjäksi"}
        fullScreen={isMobile}
      >
        <Stack>
          {meal.description && (
            <Blockquote color="blue" icon={<IconInfoCircle />} mt="xs">
              {meal.description}
            </Blockquote>
          )}
          <Textarea
            label={`Kommentti (JULKINEN!)${meal.requiresComment ? " *" : ""}`}
            description={
              meal.requiresComment
                ? "Kommentti vaaditaan ilmoittautuessa, katso ohjeet yllä."
                : "Voit kertoa esim. toiveista tai liittää mukavan viestin (valinnainen)"
            }
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          <Group>
            <Button onClick={closeComment} variant="default">
              Peruuta
            </Button>
            <Button
              onClick={async () => {
                if (meal.requiresComment && !comment.trim()) {
                  notifications.show({
                    title: "Kommentti puuttuu",
                    message: "Kommentti on pakollinen tälle aterialle",
                    color: "red",
                  });
                  return;
                }

                if (isEditingComment) {
                  if (!eater?.id) return;
                  updateEaterComment.mutate(
                    { id: eater.id, comment: comment.trim() || null },
                    {
                      onSuccess: () => {
                        notifications.show({
                          title: "Kommentti päivitetty",
                          message: "Kommenttisi on tallennettu",
                          color: "green",
                        });
                        closeComment();
                      },
                    },
                  );
                } else {
                  if (!meal.id) return;
                  addEater.mutate(
                    { mealId: meal.id, comment: comment.trim() || null },
                    {
                      onSuccess: () => {
                        notifications.show({
                          title: "Ilmoittautuminen onnistui",
                          message: "Olet ilmoittautunut syöjäksi",
                          color: "green",
                        });
                        closeComment();
                      },
                    },
                  );
                }
              }}
              disabled={
                !participation || (!isChef && dayjs(meal.signupEnd) <= dayjs())
              }
            >
              {isEditingComment ? "Tallenna" : "Ilmoittaudu"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
