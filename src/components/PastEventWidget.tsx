import {
  Accordion,
  Anchor,
  Button,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCurrencyEuro, IconCurrencyEuroOff } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import useGetParticipationsByEventId from "../api/useGetParticipationsByEventId.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdateParticipationPaid from "../api/useUpdateParticipationPaid.hook";
import eventSchema from "../schemas/eventSchema";
import participationSchema from "../schemas/participationSchema";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

export default function PastEventWidget({
  event,
}: {
  event: z.infer<typeof eventSchema>;
}) {
  const { data: user } = useGetUser();
  const { data: users, isLoading: isLoadingUserProfiles } =
    useGetUserProfiles();
  const { data: participants, isLoading: isLoadingParticipants } =
    useGetParticipationsByEventId(event.id);
  const isOrganizer = user?.data.id === event.organizer;
  const participant = participants?.data.data.find(
    (p: z.infer<typeof participationSchema>) => p.userId === user?.data.id,
  );

  const updateParticipationPaid = useUpdateParticipationPaid();

  if (isLoadingUserProfiles || isLoadingParticipants) return <Loader />;

  return (
    <Grid.Col span={6}>
      <Paper shadow="xs" p={{ base: "xs", sm: "md", lg: "xl" }}>
        <Accordion
          defaultValue={[event.title, "Osallistujat", "Toiminnot"]}
          multiple
        >
          <Accordion.Item value={event.title}>
            <Accordion.Control>
              <Title order={3}>{event.title}</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text>
                {dayjs(event.startDate).format("L LT")} -{" "}
                {dayjs(event.endDate).format("L LT")}
              </Text>
              <Text>{event.description}</Text>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Osallistujat">
            <Accordion.Control>
              Osallistujat: {participants?.data.data.length}
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid spacing="xs" cols={{ base: 2, md: 3, lg: 6 }}>
                {participants?.data.data.map(
                  (p: z.infer<typeof participationSchema>) => {
                    const user = users?.data.find(
                      (u: { id: number }) => u.id === p.userId,
                    );
                    return (
                      <div key={p.userId}>
                        <Group>
                          {user?.avatar ? (
                            <Image
                              src={`https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.png?size=16`}
                              fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                              alt={`${user.nickname || user.username} avatar`}
                              mah={16}
                              w="auto"
                              fit="contain"
                            />
                          ) : (
                            <Image
                              src="https://cdn.discordapp.com/embed/avatars/0.png"
                              alt={`${user.nickname || user.username} avatar`}
                              mah={16}
                              w="auto"
                              fit="contain"
                            />
                          )}
                          {user?.nickname || user?.username}

                          {p.paid === 0 && (
                            <ThemeIcon size="sm" color="red">
                              <IconCurrencyEuroOff />
                            </ThemeIcon>
                          )}

                          {p.paid === 1 && (
                            <ThemeIcon size="sm" color="yellow">
                              <IconCurrencyEuro />
                            </ThemeIcon>
                          )}

                          {p.paid === 2 && (
                            <ThemeIcon size="sm" color="green">
                              <IconCurrencyEuro />
                            </ThemeIcon>
                          )}

                          {isOrganizer && (
                            <>
                              {p.paid < 2 && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  color="green"
                                  onClick={() =>
                                    updateParticipationPaid.mutate(
                                      {
                                        id: p.id,
                                        paidLevel: 2,
                                      },
                                      {
                                        onSuccess: () => {
                                          notifications.show({
                                            title: "Maksettu",
                                            message:
                                              "Osallistuja merkattu maksetuksi",
                                            color: "green",
                                          });
                                        },
                                      },
                                    )
                                  }
                                  disabled={!p.id}
                                >
                                  Merkkaa maksu
                                </Button>
                              )}
                              {p.paid > 0 && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  color="red"
                                  onClick={() =>
                                    updateParticipationPaid.mutate(
                                      {
                                        id: p.id,
                                        paidLevel: 0,
                                      },
                                      {
                                        onSuccess: () => {
                                          notifications.show({
                                            title: "Maksu poistettu",
                                            message:
                                              "Syöjä merkattu maksamattomaksi",
                                            color: "green",
                                          });
                                        },
                                      },
                                    )
                                  }
                                  disabled={!p.id}
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
              {participant && (
                <>
                  {participant.paid === 0 && (
                    <>
                      <Button
                        mt="xs"
                        onClick={() =>
                          updateParticipationPaid.mutate({
                            id: participant.id,
                            paidLevel: 1,
                          })
                        }
                        disabled={!participant.id}
                      >
                        Merkitse maksetuksi
                      </Button>
                    </>
                  )}
                  {participant.paid === 1 && (
                    <Button
                      mt="xs"
                      onClick={() =>
                        updateParticipationPaid.mutate({
                          id: participant.id,
                          paidLevel: 0,
                        })
                      }
                      color="orange"
                      disabled={!participant.id}
                    >
                      Merkitse maksamattomaksi
                    </Button>
                  )}
                </>
              )}
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Toiminnot">
            <Accordion.Control>Toiminnot</Accordion.Control>
            <Accordion.Panel>
              <Group>
                {event.votingState >= 2 && (
                  <>
                    <Anchor
                      component={Link}
                      href={`/dashboard/schedule/${event.id}`}
                    >
                      Aikataulu
                    </Anchor>

                    <Anchor
                      component={Link}
                      href={`/dashboard/results/${event.id}`}
                    >
                      Peliäänestyksen tulokset
                    </Anchor>
                  </>
                )}
                <Anchor component={Link} href={`/dashboard/meals/${event.id}`}>
                  Ateriat
                </Anchor>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </Grid.Col>
  );
}
