import {
  Accordion,
  Anchor,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import useGetParticipationsByEventId from "../api/useGetParticipationsByEventId.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import eventSchema from "../schemas/eventSchema";
import participationSchema from "../schemas/participationSchema";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

export default function EventWidget({
  event,
}: {
  event: z.infer<typeof eventSchema>;
}) {
  const { data: users, isLoading: isLoadingUserProfiles } =
    useGetUserProfiles();
  const { data: participants, isLoading: isLoadingParticipants } =
    useGetParticipationsByEventId(event.id);

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
                        </Group>
                      </div>
                    );
                  },
                )}
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Toiminnot">
            <Accordion.Control>Toiminnot</Accordion.Control>
            <Accordion.Panel>
              <Group>
                {(event.votingState === 2 || event.votingState === 3) && (
                  <Anchor component={Link} href={`/dashboard/vote/${event.id}`}>
                    Äänestys
                  </Anchor>
                )}
                {event.votingState === 0 && (
                  <Anchor component={Link} href="/dashboard/game-suggestions">
                    Peliehdotukset
                  </Anchor>
                )}
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
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </Grid.Col>
  );
}
