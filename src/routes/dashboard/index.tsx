import { noop } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import { queryClient } from "../../api/queryClient";
import useGetEvents, { eventsQueryOptions } from "../../api/useGetEvents.hook";
import useGetLocations, {
  locationsQueryOptions,
} from "../../api/useGetLocations.hook";
import useGetParticipationsByUserId from "../../api/useGetParticipationsByUserId.hook";
import useGetUser from "../../api/useGetUser.hook";
import "dayjs/locale/fi";
import { Box, Grid, Loader, Text, Timeline, Title } from "@mantine/core";
import {
  IconArchive,
  IconCalendarEvent,
  IconClockPause,
  IconExclamationMark,
  IconNetwork,
} from "@tabler/icons-react";
import { z } from "zod";
import useGetActivitiesByEventId from "../../api/useGetActivitiesByEventId.hook";
import CountdownTimer from "../../components/CountdownTimer";
import EventWidget from "../../components/EventWidget";
import PastEventList from "../../components/PastEventList";
import SectionPanel from "../../components/SectionPanel";
import UpcomingEventList from "../../components/UpcomingEventList";
import activitySchema from "../../schemas/activitySchema";
import eventSchema from "../../schemas/eventSchema";
import classes from "./index.module.css";

dayjs.locale("fi");
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);

export const Route = createFileRoute("/dashboard/")({
  loader: () => {
    // Start independent requests before the protected layout mounts the page.
    void queryClient.query(eventsQueryOptions).catch(noop);
    void queryClient.query(locationsQueryOptions).catch(noop);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useGetUser();
  const { data, isLoading } = useGetEvents();
  const { data: locations, isLoading: isLoadingLocations } = useGetLocations();
  const { data: participations, isLoading: isLoadingParticipations } =
    useGetParticipationsByUserId(user?.data.id);
  const now = dayjs();
  const currentEvent = data?.data.data.findLast(
    (event: z.infer<typeof eventSchema>) =>
      event.active &&
      now.isBetween(dayjs(event.startDate), dayjs(event.endDate)),
  );
  const { data: activities, isLoading: isLoadingActivities } =
    useGetActivitiesByEventId(currentEvent?.id);

  if (isLoading || isLoadingLocations || isLoadingParticipations) {
    return <Loader />;
  }

  const {
    upcomingEvents,
    pastEvents,
  }: {
    upcomingEvents: z.infer<typeof eventSchema>[];
    pastEvents: z.infer<typeof eventSchema>[];
  } = (data?.data.data ?? []).reduce(
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

  upcomingEvents.sort(
    (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
  );
  const nextEvent = upcomingEvents[0];
  const featuredEvent = currentEvent ?? nextEvent;

  const participatingEvents = (data?.data.data ?? []).filter(
    (lanEvent: z.infer<typeof eventSchema>) =>
      lanEvent.active &&
      participations?.data.data.find(
        (p: { eventId: number }) =>
          p.eventId === lanEvent.id && new Date() < new Date(lanEvent.endDate),
      ),
  );

  // get current and next activity based on current time
  const sortedActivities = [...(activities?.data.data ?? [])].sort(
    (a: z.infer<typeof activitySchema>, b: z.infer<typeof activitySchema>) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const currentActivity = sortedActivities?.find(
    (activity: z.infer<typeof activitySchema>) =>
      now.isBetween(dayjs(activity.startDate), dayjs(activity.endDate)),
  );
  const nextActivity = sortedActivities?.find(
    (activity: z.infer<typeof activitySchema>) =>
      dayjs(activity.startDate).isAfter(currentActivity?.endDate ?? now) ||
      dayjs(activity.startDate).isSame(currentActivity?.endDate ?? now),
  );

  return (
    <Grid gap="sm">
      {featuredEvent && (
        <Grid.Col span={12}>
          <SectionPanel
            title={currentEvent ? "Tapahtuma käynnissä" : "Seuraava tapahtuma"}
            icon={<IconNetwork size={16} />}
          >
            <div className={classes.eventSummary}>
              <div>
                <Title order={3} mb="sm">
                  {featuredEvent.title}
                </Title>
                <dl className={classes.details}>
                  <dt>Aika</dt>
                  <dd>
                    {dayjs(featuredEvent.startDate).format("D.M.YYYY HH:mm")}
                    {" – "}
                    {dayjs(featuredEvent.endDate).format("D.M.YYYY HH:mm")}
                  </dd>
                  <dt>Paikka</dt>
                  <dd>
                    {locations?.data.data.find(
                      (location: { id: number }) =>
                        location.id === featuredEvent.location,
                    )?.name ?? "–"}
                  </dd>
                </dl>
                {featuredEvent.description && (
                  <Text size="sm" mt="sm">
                    {featuredEvent.description}
                  </Text>
                )}
              </div>
              {!currentEvent && nextEvent && (
                <Box className={classes.countdown}>
                  <Text size="xs" mb="xs">
                    Tapahtuman alkuun:
                  </Text>
                  <CountdownTimer
                    startDate={dayjs(nextEvent.startDate).toISOString()}
                  />
                </Box>
              )}
            </div>
          </SectionPanel>
        </Grid.Col>
      )}
      {currentEvent && (
        <Grid.Col span={12}>
          <SectionPanel title="Juuri nyt" icon={<IconClockPause size={18} />}>
            {isLoadingActivities && <Loader size="sm" />}
            {!isLoadingActivities && currentActivity && (
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
            {!isLoadingActivities && !currentActivity && (
              <Text c="dimmed" size="sm">
                Ei aikataulutettua aktiviteettia juuri nyt.
              </Text>
            )}
          </SectionPanel>
        </Grid.Col>
      )}
      {participatingEvents.length > 0 &&
        participatingEvents.map((event: z.infer<typeof eventSchema>) => (
          <EventWidget key={event.id} event={event} />
        ))}
      <Grid.Col span={12}>
        <SectionPanel
          title="Tulevat tapahtumat"
          icon={<IconCalendarEvent size={18} />}
          aside={
            <Text size="xs">
              {upcomingEvents.length}{" "}
              {upcomingEvents.length === 1 ? "tapahtuma" : "tapahtumaa"}
            </Text>
          }
        >
          {upcomingEvents.length > 0 ? (
            <UpcomingEventList
              data={upcomingEvents}
              locations={locations?.data.data ?? []}
            />
          ) : (
            <Text c="dimmed" size="sm" py="sm">
              Ei tulevia tapahtumia.
            </Text>
          )}
        </SectionPanel>
      </Grid.Col>
      <Grid.Col span={12}>
        <SectionPanel
          title="Menneet tapahtumat"
          icon={<IconArchive size={18} />}
          aside={<Text size="xs">{pastEvents.length} arkistossa</Text>}
        >
          {pastEvents.length > 0 ? (
            <PastEventList
              data={pastEvents}
              locations={locations?.data.data ?? []}
            />
          ) : (
            <Text c="dimmed" size="sm" py="sm">
              Ei vielä menneitä tapahtumia.
            </Text>
          )}
        </SectionPanel>
      </Grid.Col>
    </Grid>
  );
}
