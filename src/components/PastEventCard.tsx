import { Group, Loader, Text } from "@mantine/core";
import React from "react";
import { z } from "zod";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import EventCard from "./EventCard";
import EventParticipants from "./EventParticipants";
import User from "./User";

export default function PastEventCard({
  lanEvent,
  locations,
}: {
  lanEvent: z.infer<typeof eventSchema>;
  locations: z.infer<typeof locationSchema>[];
}) {
  const { data, isPending } = useGetUserProfiles();

  return (
    <EventCard
      lanEvent={lanEvent}
      locations={locations}
      past
      footer={<EventParticipants eventId={lanEvent.id} />}
    >
      {isPending ? (
        <Loader size="sm" />
      ) : (
        <>
          {lanEvent.paintCompoWinner && (
            <div>
              <Text size="sm" fw={600}>
                Paintkompo-voittaja
              </Text>
              <Group gap="xs" mt={4}>
                <User
                  userId={lanEvent.paintCompoWinner}
                  users={data?.data ?? []}
                />
              </Group>
            </div>
          )}
          {lanEvent.lanMaster && (
            <div>
              <Text size="sm" fw={600}>
                LAN-mestari
              </Text>
              <Group gap="xs" mt={4}>
                <User userId={lanEvent.lanMaster} users={data?.data ?? []} />
              </Group>
            </div>
          )}
        </>
      )}
    </EventCard>
  );
}
