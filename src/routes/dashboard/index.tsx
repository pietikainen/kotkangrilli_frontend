import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import useGetEvents from "../../api/useGetEvents.hook";
import useGetLocations from "../../api/useGetLocations.hook";
import useGetParticipationsByUserId from "../../api/useGetParticipationsByUserId.hook";
import useGetUser from "../../api/useGetUser.hook";
import "dayjs/locale/fi";
import { Grid, Loader, Paper, Text, Timeline, Title } from "@mantine/core";
import { IconClockPause, IconExclamationMark } from "@tabler/icons-react";
import { z } from "zod";
import useGetActivitiesByEventId from "../../api/useGetActivitiesByEventId.hook";
import CountdownTimer from "../../components/CountdownTimer";
import EventWidget from "../../components/EventWidget";
import PastEventTable from "../../components/tables/PastEventTable";
import UpcomingEventTable from "../../components/tables/UpcomingEventTable";
import activitySchema from "../../schemas/activitySchema";
import eventSchema from "../../schemas/eventSchema";
import "./index.css";

dayjs.locale("fi");
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useGetUser();
  const { data, isLoading } = useGetEvents();
  const { data: locations, isLoading: isLoadingLocations } = useGetLocations();
  const { data: participations, isLoading: isLoadingParticipations } =
    useGetParticipationsByUserId(user?.data.id);
  const [currentEvent, setCurrentEvent] =
    useState<z.infer<typeof eventSchema>>();
  const { data: activities, isLoading: isLoadingActivities } =
    useGetActivitiesByEventId(currentEvent?.id);

  const now = dayjs();

  useEffect(() => {
    if (!data?.data.data) return;
    data?.data.data.forEach((event: z.infer<typeof eventSchema>) => {
      if (
        event.active &&
        dayjs(now).isBetween(dayjs(event.startDate), dayjs(event.endDate))
      ) {
        setCurrentEvent(event);
      }
    });
  }, [data]);

  if (
    isLoading ||
    isLoadingLocations ||
    isLoadingParticipations ||
    isLoadingActivities
  ) {
    return <Loader />;
  }

  const { upcomingEvents, pastEvents } = (data?.data.data ?? []).reduce(
    (
      acc: {
        upcomingEvents: z.infer<typeof eventSchema>[];
        pastEvents: z.infer<typeof eventSchema>[];
      },
      lanEvent: z.infer<typeof eventSchema>,
    ) => {
      if (lanEvent.active) {
        if (new Date() < new Date(lanEvent.startDate)) {
          acc.upcomingEvents.push(lanEvent);
        } else if (new Date() > new Date(lanEvent.endDate)) {
          acc.pastEvents.push(lanEvent);
        }
      }
      return acc;
    },
    { upcomingEvents: [], pastEvents: [] },
  );

  const participatingEvents = data?.data.data.filter(
    (lanEvent: z.infer<typeof eventSchema>) =>
      lanEvent.active &&
      participations?.data.data.find(
        (p: { eventId: number }) =>
          p.eventId === lanEvent.id && new Date() < new Date(lanEvent.endDate),
      ),
  );

  // get current and next activity based on current time
  const sortedActivities = activities?.data.data.sort(
    (a: z.infer<typeof activitySchema>, b: z.infer<typeof activitySchema>) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const currentActivity = sortedActivities?.find(
    (activity: z.infer<typeof activitySchema>) =>
      now.isBetween(dayjs(activity.startDate), dayjs(activity.endDate)),
  );
  const nextActivity = sortedActivities?.find(
    (activity: z.infer<typeof activitySchema>) =>
      dayjs(activity.startDate).isAfter(currentActivity?.startDate),
  );

  return (
    <Grid grow>
      {upcomingEvents.length > 0 &&
        dayjs(upcomingEvents[0].startDate).isBetween(
          dayjs().add(7, "day"),
          now,
        ) && (
          <Grid.Col span={12}>
            <Paper shadow="xs" p={{ base: "xs", sm: "md", lg: "xl" }}>
              <CountdownTimer startDate={upcomingEvents[0].startDate} />
            </Paper>
          </Grid.Col>
        )}
      {currentEvent && (
        <Grid.Col span={12}>
          <Title order={2} mb="1rem">
            LANIT! - {currentEvent.title}
          </Title>
          {currentActivity && (
            <Timeline active={0} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={<IconExclamationMark size={12} />}
                title={currentActivity.title}
              >
                <Text c="dimmed" size="sm">
                  Meneillään oleva aktiviteetti
                </Text>
                <Text size="xs" mt={4}>
                  Alkoi {dayjs(currentActivity.startDate).fromNow()}
                </Text>
              </Timeline.Item>
              {nextActivity && (
                <Timeline.Item
                  bullet={<IconClockPause size={12} />}
                  title={nextActivity.title}
                >
                  <Text c="dimmed" size="sm">
                    Seuraava aktiviteetti
                  </Text>
                  <Text size="xs" mt={4}>
                    Alkaa {dayjs(nextActivity.startDate).fromNow()}
                  </Text>
                </Timeline.Item>
              )}
            </Timeline>
          )}
        </Grid.Col>
      )}
      {participatingEvents.length > 0 &&
        participatingEvents.map((event: z.infer<typeof eventSchema>) => (
          <EventWidget key={event.id} event={event} />
        ))}
      <Grid.Col span={12}>
        <Paper shadow="xs" p={{ base: "xs", sm: "md", lg: "xl" }}>
          <Title order={2}>Tulevat tapahtumat</Title>
          {upcomingEvents.length > 0 ? (
            <UpcomingEventTable
              data={upcomingEvents}
              locations={locations?.data.data}
            />
          ) : (
            <Text>Ei tulevia tapahtumia</Text>
          )}
        </Paper>
      </Grid.Col>
      <Grid.Col span={12}>
        <Paper shadow="xs" p={{ base: "xs", sm: "md", lg: "xl" }}>
          <Title order={2}>Menneet tapahtumat</Title>
          {pastEvents.length > 0 ? (
            <PastEventTable
              data={pastEvents}
              locations={locations?.data.data}
            />
          ) : (
            <Text>Ei menneitä tapahtumia</Text>
          )}
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
