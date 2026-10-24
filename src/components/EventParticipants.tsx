import { Group, Loader, SimpleGrid, Text } from "@mantine/core";
import dayjs from "dayjs";
import React, { useState } from "react";
import { z } from "zod";
import useGetParticipationsByEventId from "../api/useGetParticipationsByEventId.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import participationSchema from "../schemas/participationSchema";
import "dayjs/locale/fi";
import classes from "./EventCard.module.css";
import User from "./User";

function ParticipantNames({
  participants,
}: {
  participants: z.infer<typeof participationSchema>[];
}) {
  const { data: users, isPending, isError } = useGetUserProfiles();

  if (isPending) return <Loader size="sm" mt="sm" />;
  if (isError)
    return (
      <Text size="sm" mt="sm">
        Osallistujien lataaminen epäonnistui.
      </Text>
    );
  if (participants.length === 0)
    return (
      <Text size="sm" mt="sm">
        Ei vielä osallistujia.
      </Text>
    );

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm" mt="sm">
      {participants.map((participant) => {
        const arrival = participant.arrivalDate
          ? dayjs(participant.arrivalDate).locale("fi")
          : null;
        return (
          <Group key={participant.id} gap="xs" wrap="wrap" fz="sm">
            <User
              userId={participant.userId}
              users={users?.data ?? []}
              avatarSize={20}
            />
            <Text
              component="span"
              size="xs"
              c="dimmed"
              title={
                arrival?.isValid()
                  ? `Saapuminen: ${arrival.format("D.M.YYYY")}`
                  : "Saapumispäivä ei tiedossa"
              }
            >
              {arrival?.isValid() ? arrival.format("dddd") : "Ei tiedossa"}
            </Text>
          </Group>
        );
      })}
    </SimpleGrid>
  );
}

export default function EventParticipants({
  eventId,
}: {
  eventId: number | undefined;
}) {
  const [opened, setOpened] = useState(false);
  const { data, isPending, isError } = useGetParticipationsByEventId(eventId);

  return (
    <details onToggle={(event) => setOpened(event.currentTarget.open)}>
      <summary className={classes.participantsSummary}>
        Osallistujat
        {data ? `: ${data.data.data.length}` : isPending ? ": …" : ""}
      </summary>
      {opened &&
        (isPending ? (
          <Loader size="sm" mt="sm" />
        ) : isError ? (
          <Text size="sm" mt="sm">
            Osallistujien lataaminen epäonnistui.
          </Text>
        ) : (
          <ParticipantNames participants={data?.data.data ?? []} />
        ))}
    </details>
  );
}
