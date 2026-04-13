import {
  Button,
  Grid,
  Loader,
  Modal,
  Paper,
  Table,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  Schedule as MantineSchedule,
  type ScheduleEventData,
  type ScheduleLabelsOverride,
  type ScheduleViewLevel,
} from "@mantine/schedule";
import dayjs from "dayjs";
import "dayjs/locale/fi";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import useDeleteActivity from "../api/useDeleteActivity.hook";
import useGetActivitiesByEventId from "../api/useGetActivitiesByEventId.hook";
import useGetEvent from "../api/useGetEvent.hook";
import useUpdateActivity from "../api/useUpdateActivity.hook";
import ActivityForm from "../components/forms/ActivityForm";
import "./Schedule.css";
import activitySchema from "../schemas/activitySchema";
import roundToNearestMinute from "../utils/roundToNearestMinute";

dayjs.locale("fi");

type Activity = z.infer<typeof activitySchema>;
const availableViews: ScheduleViewLevel[] = ["day", "week"];
const scheduleLabels: ScheduleLabelsOverride = {
  today: "Tänään",
  next: "Seuraava",
  previous: "Edellinen",
  day: "Päivä",
  week: "Viikko",
  timeSlot: "Aikaväli",
  switchToDayView: "Vaihda päivänäkymään",
  switchToWeekView: "Vaihda viikkonäkymään",
  viewSelectLabel: "Kalenterin näkymä",
  noEvents: "Ei tapahtumia",
};

function toScheduleDateTime(value: Date) {
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
}

function fromScheduleDateTime(value: string) {
  return dayjs(value.replace(" ", "T")).toDate();
}

function getActivityDurationHours(activity: Activity) {
  return dayjs(activity.endDate).diff(dayjs(activity.startDate), "hours", true);
}

function getDefaultNewActivity(
  eventId: number,
  fallbackDate: string,
): Activity {
  const startDate = roundToNearestMinute(new Date(fallbackDate));
  const endDate = roundToNearestMinute(
    dayjs(startDate).add(1, "hour").toDate(),
  );

  return {
    eventId,
    title: "",
    startDate,
    endDate,
    color: "#228be6",
  };
}

export default function Schedule({
  eventId,
  admin,
}: {
  eventId: number;
  admin?: boolean;
}) {
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: activities, isLoading: isLoadingActivities } =
    useGetActivitiesByEventId(eventId);
  const deleteActivity = useDeleteActivity();
  const updateActivity = useUpdateActivity();

  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [draftActivity, setDraftActivity] = useState<Activity>();
  const [editedActivity, setEditedActivity] = useState<Activity>();
  const [hasInitializedDate, setHasInitializedDate] = useState(false);
  const [scheduleView, setScheduleView] = useState<ScheduleViewLevel>(
    isMobile ? "day" : "week",
  );
  const [scheduleDate, setScheduleDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );

  const activityList = activities?.data.data ?? [];
  const sortedActivities = [...activityList].sort(
    (a: Activity, b: Activity) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  useEffect(() => {
    if (hasInitializedDate) {
      return;
    }

    const firstActivity = sortedActivities[0];
    if (firstActivity?.startDate) {
      setScheduleDate(dayjs(firstActivity.startDate).format("YYYY-MM-DD"));
      setHasInitializedDate(true);
      return;
    }

    const eventStartDate = event?.data.data.startDate;
    if (eventStartDate) {
      setScheduleDate(dayjs(eventStartDate).format("YYYY-MM-DD"));
      setHasInitializedDate(true);
    }
  }, [event?.data.data.startDate, hasInitializedDate, sortedActivities]);

  useEffect(() => {
    setScheduleView((currentView) => {
      if (isMobile && currentView === "week") {
        return "day";
      }

      if (!isMobile && currentView === "day") {
        return "week";
      }

      return currentView;
    });
  }, [isMobile]);

  if (isLoadingEvent || isLoadingActivities) {
    return <Loader />;
  }

  const scheduleEvents: ScheduleEventData[] = sortedActivities.map(
    (activity: Activity) => ({
      id: activity.id ?? 0,
      title: activity.title,
      start: toScheduleDateTime(new Date(activity.startDate)),
      end: toScheduleDateTime(new Date(activity.endDate)),
      color: activity.color,
    }),
  );

  const hoursPerActivity = sortedActivities.reduce(
    (acc: Record<string, number>, curr: Activity) => {
      if (
        curr.title === "Ei viela" ||
        curr.title === "Ei vielä" ||
        curr.title === "Kotiin"
      ) {
        return acc;
      }

      if (!acc[curr.title]) {
        acc[curr.title] = 0;
      }

      acc[curr.title] += getActivityDurationHours(curr);
      return acc;
    },
    {},
  );

  const rows = (Object.entries(hoursPerActivity) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([title, hours]) => (
      <Table.Tr key={title}>
        <Table.Td>{title}</Table.Td>
        <Table.Td>{hours.toFixed(1)} h</Table.Td>
      </Table.Tr>
    ));

  function openCreateModal(start: string, end?: string) {
    setDraftActivity({
      ...getDefaultNewActivity(eventId, start),
      startDate: roundToNearestMinute(fromScheduleDateTime(start)),
      endDate: roundToNearestMinute(
        end
          ? fromScheduleDateTime(end)
          : dayjs(fromScheduleDateTime(start)).add(1, "hour").toDate(),
      ),
    });
    open();
  }

  function handleEdit(activity: Activity) {
    setEditedActivity(activity);
    openEdit();
  }

  function handleEventClick(selectedEvent: ScheduleEventData) {
    if (!admin) {
      return;
    }

    const matchingActivity = sortedActivities.find(
      (activity: Activity) => activity.id === Number(selectedEvent.id),
    );

    if (matchingActivity) {
      handleEdit(matchingActivity);
    }
  }

  function handleEventTimeChange({
    eventId: changedEventId,
    newStart,
    newEnd,
  }: {
    eventId: string | number;
    newStart: string;
    newEnd: string;
  }) {
    const activity = sortedActivities.find(
      (entry: Activity) => entry.id === Number(changedEventId),
    );

    if (!activity?.id) {
      return;
    }

    updateActivity.mutate({
      activityId: activity.id,
      activity: {
        ...activity,
        startDate: roundToNearestMinute(fromScheduleDateTime(newStart)),
        endDate: roundToNearestMinute(fromScheduleDateTime(newEnd)),
      },
    });
  }

  return (
    <>
      <Title order={2}>Aikataulu - {event?.data.data.title}</Title>
      {admin && (
        <>
          <Button
            onClick={() =>
              openCreateModal(
                dayjs(scheduleDate)
                  .hour(12)
                  .minute(0)
                  .second(0)
                  .format("YYYY-MM-DD HH:mm:ss"),
              )
            }
            mb="md"
          >
            Lisää aktiviteetti
          </Button>
          <Modal
            opened={opened}
            onClose={close}
            title="Lisää"
            fullScreen={isMobile}
          >
            <ActivityForm
              key={`new-${draftActivity?.startDate.toISOString() ?? scheduleDate}`}
              close={close}
              eventObject={event?.data.data}
              activity={draftActivity}
            />
          </Modal>
          <Modal
            opened={editOpened}
            onClose={closeEdit}
            title="Muokkaa"
            fullScreen={isMobile}
          >
            <ActivityForm
              key={editedActivity?.id ?? "edit"}
              close={closeEdit}
              eventObject={event?.data.data}
              activity={editedActivity}
            />
            {editedActivity?.id && (
              <Button
                color="red"
                mt="md"
                onClick={() => {
                  deleteActivity.mutate(editedActivity.id as number, {
                    onSuccess: () => {
                      closeEdit();
                    },
                  });
                }}
                loading={deleteActivity.isPending}
              >
                Poista aktiviteetti
              </Button>
            )}
          </Modal>
        </>
      )}
      <Grid>
        <Grid.Col span={{ base: 12, xl: 9 }}>
          <Paper shadow="xs" p="sm" withBorder>
            <MantineSchedule
              events={scheduleEvents}
              labels={scheduleLabels}
              date={scheduleDate}
              onDateChange={setScheduleDate}
              view={scheduleView}
              onViewChange={setScheduleView}
              onEventClick={admin ? handleEventClick : undefined}
              onTimeSlotClick={
                admin
                  ? ({
                      slotStart,
                      slotEnd,
                    }: {
                      slotStart: string;
                      slotEnd: string;
                    }) => openCreateModal(slotStart, slotEnd)
                  : undefined
              }
              onSlotDragEnd={admin ? openCreateModal : undefined}
              withDragSlotSelect={admin}
              withEventsDragAndDrop={admin}
              onEventDrop={admin ? handleEventTimeChange : undefined}
              withEventResize={admin}
              onEventResize={admin ? handleEventTimeChange : undefined}
              dayViewProps={{
                startTime: "00:00:00",
                endTime: "23:59:00",
                intervalMinutes: 60,
                withAllDaySlot: false,
                slotHeight: 36,
                viewSelectProps: {
                  views: availableViews,
                },
              }}
              weekViewProps={{
                firstDayOfWeek: 4,
                startTime: "00:00:00",
                endTime: "23:59:00",
                intervalMinutes: 60,
                withAllDaySlots: false,
                slotHeight: 36,
                todayControlProps: {
                  style: { display: "none" },
                },
                weekendDays: [1, 2, 3],
                withWeekendDays: false,
                viewSelectProps: {
                  views: availableViews,
                },
              }}
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 3 }}>
          <Paper shadow="xs" p="sm" withBorder>
            <Table>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
