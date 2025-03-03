import {
  ActionIcon,
  Alert,
  Button,
  Grid,
  Indicator,
  Loader,
  Modal,
  Paper,
  Table,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import React, { useEffect, useState } from "react";
import useDeleteActivity from "../api/useDeleteActivity.hook";
import useGetActivitiesByEventId from "../api/useGetActivitiesByEventId.hook";
import useGetEvent from "../api/useGetEvent.hook";
import ActivityForm from "../components/forms/ActivityForm";
import "dayjs/locale/fi";
import { z } from "zod";
import activitySchema from "../schemas/activitySchema";

dayjs.locale("fi");
dayjs.extend(isBetween);

function getIndicatorPosition(
  startDate: Date,
  endDate: Date,
): "top-end" | "middle-end" | "bottom-end" {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const now = dayjs();

  const totalDuration = end.diff(start, "minutes");
  const elapsedDuration = now.diff(start, "minutes");

  const elapsedPercentage = (elapsedDuration / totalDuration) * 100;

  if (elapsedPercentage < 33) {
    return "top-end";
  }
  if (elapsedPercentage < 66) {
    return "middle-end";
  }
  return "bottom-end";
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
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [days, setDays] = useState<z.infer<typeof activitySchema>[][]>([]);
  const [editedActivity, setEditedActivity] =
    useState<z.infer<typeof activitySchema>>();
  const [lastDate, setLastDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!activities?.data.data || activities?.data.data.length === 0) return;
    const sortedActivities = activities?.data.data.sort(
      (a: z.infer<typeof activitySchema>, b: z.infer<typeof activitySchema>) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    const lastActivity = sortedActivities.slice(-1)[0];
    setLastDate(new Date(lastActivity.endDate));
    let currentDay: dayjs.Dayjs | null = null;
    const newDays: z.infer<typeof activitySchema>[][] = [];
    sortedActivities.forEach((activity: z.infer<typeof activitySchema>) => {
      if (
        !dayjs(currentDay).isSame(dayjs(activity.startDate), "day") &&
        dayjs(activity.startDate).format("HH:mm") === "10:00"
      ) {
        newDays.push([]);
        currentDay = dayjs(activity.startDate);
      }
      newDays[newDays.length - 1].push(activity);
    });
    setDays(newDays);
  }, [activities]);

  const deleteActivity = useDeleteActivity();

  function handleEdit(activity: z.infer<typeof activitySchema>) {
    setEditedActivity(activity);
    openEdit();
  }

  if (isLoadingEvent || isLoadingActivities) return <Loader />;

  const hoursPerActivity = activities?.data.data.reduce(
    (acc: { [key: string]: number }, curr: z.infer<typeof activitySchema>) => {
      const hours = dayjs(curr.endDate).diff(dayjs(curr.startDate), "hours");

      if (curr.title === "Ei vielä" || curr.title === "Kotiin") return acc;

      if (!acc[curr.title]) {
        acc[curr.title] = 0;
      }

      acc[curr.title] += hours;
      return acc;
    },
    {},
  );

  const sortedActivities = Object.entries(
    hoursPerActivity as Record<string, number>,
  ).sort((a, b) => b[1] - a[1]);

  const rows = sortedActivities.map(([title, hours]) => (
    <Table.Tr key={title}>
      <Table.Td>{title}</Table.Td>
      <Table.Td>{hours} h</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2}>Aikataulu - {event?.data.data.title}</Title>
      {admin && (
        <>
          <Button onClick={() => open()}>Lisää aktiviteetti</Button>
          <Modal
            opened={opened}
            onClose={close}
            title="Lisää"
            fullScreen={isMobile}
          >
            <ActivityForm
              close={close}
              eventObject={event?.data.data}
              lastDate={lastDate}
            />
          </Modal>
          <Modal
            opened={editOpened}
            onClose={closeEdit}
            title="Muokkaa"
            fullScreen={isMobile}
          >
            <ActivityForm
              close={closeEdit}
              eventObject={event?.data.data}
              activity={editedActivity}
            />
          </Modal>
        </>
      )}
      <Grid grow>
        {days.map((day: z.infer<typeof activitySchema>[], index: number) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 3 }}>
            <Paper shadow="xs" p="sm" withBorder>
              <Title order={3}>{dayjs(day[0].startDate).format("dddd")}</Title>
              {day.map((activity: z.infer<typeof activitySchema>) => {
                const hours =
                  dayjs(activity.endDate).diff(
                    dayjs(activity.startDate),
                    "hours",
                  ) - 1;
                const dynamicHeight = Math.max(38, 38 + hours * 38);
                const active = dayjs().isBetween(
                  activity.startDate,
                  activity.endDate,
                );
                let indicatorPosition: "top-end" | "middle-end" | "bottom-end" =
                  "top-end";
                if (active) {
                  indicatorPosition = getIndicatorPosition(
                    activity.startDate,
                    activity.endDate,
                  );
                }
                const alert = (
                  <Alert
                    key={activity.id}
                    color={activity.color}
                    radius={0}
                    styles={{
                      root: {
                        height: dynamicHeight,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        paddingTop: 0,
                        paddingBottom: 0,
                        borderBottom: `1px solid ${activity.color}`,
                      },
                    }}
                    title={
                      <>
                        {active && ">"}
                        {dayjs(activity.startDate).format("H:mm")}{" "}
                        {activity.title}
                        {admin && (
                          <>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="compact-xs"
                              onClick={() =>
                                activity.id &&
                                deleteActivity.mutate(activity.id)
                              }
                              disabled={!activity.id}
                            >
                              <IconTrash />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              size="compact-xs"
                              onClick={() => handleEdit(activity)}
                            >
                              <IconEdit />
                            </ActionIcon>
                          </>
                        )}
                      </>
                    }
                  />
                );
                return active ? (
                  <Indicator
                    key={activity.id}
                    color="red"
                    processing
                    position={indicatorPosition}
                  >
                    {alert}
                  </Indicator>
                ) : (
                  alert
                );
              })}
            </Paper>
          </Grid.Col>
        ))}
        <Grid.Col span={12}>
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
