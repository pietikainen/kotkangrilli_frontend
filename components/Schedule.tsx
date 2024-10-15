import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useEffect, useState } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Button,
  Grid,
  Indicator,
  Loader,
  Modal,
  Paper,
  Title,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import useDeleteActivity from '@/api/useDeleteActivity.hook';
import useGetActivitiesByEventId from '@/api/useGetActivitiesByEventId.hook';
import useGetEvent from '@/api/useGetEvent.hook';
import ActivityForm from '@/components/forms/ActivityForm';

import 'dayjs/locale/fi';

dayjs.locale('fi');
dayjs.extend(isBetween);

interface Activity {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: string;
}

function getIndicatorPosition(
  startDate: string,
  endDate: string
): 'top-end' | 'middle-end' | 'bottom-end' {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const now = dayjs();

  const totalDuration = end.diff(start, 'minutes');
  const elapsedDuration = now.diff(start, 'minutes');

  const elapsedPercentage = (elapsedDuration / totalDuration) * 100;

  if (elapsedPercentage < 33) {
    return 'top-end';
  }
  if (elapsedPercentage < 66) {
    return 'middle-end';
  }
  return 'bottom-end';
}

export default function Schedule({ eventId, admin }: { eventId: number; admin?: boolean }) {
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: activities, isLoading: isLoadingActivities } = useGetActivitiesByEventId(eventId);
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 50em)');
  const [days, setDays] = useState<Activity[][]>([]);
  const [editedActivity, setEditedActivity] = useState<Activity>();
  const [lastDate, setLastDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!activities?.data.data) return;
    const sortedActivities = activities?.data.data.sort(
      (a: Activity, b: Activity) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const lastActivity = sortedActivities.slice(-1)[0];
    setLastDate(new Date(lastActivity.endDate));
    let currentDay: dayjs.Dayjs | null = null;
    const newDays: Activity[][] = [];
    sortedActivities.forEach((activity: Activity) => {
      if (
        !dayjs(currentDay).isSame(activity.startDate, 'day') &&
        dayjs(activity.startDate).format('HH:mm') === '10:00'
      ) {
        newDays.push([]);
        currentDay = dayjs(activity.startDate);
      }
      newDays[newDays.length - 1].push(activity);
    });
    setDays(newDays);
  }, [activities]);

  const deleteActivity = useDeleteActivity();

  function handleEdit(activity: Activity) {
    setEditedActivity(activity);
    openEdit();
  }

  if (isLoadingEvent || isLoadingActivities) return <Loader />;

  return (
    <>
      <Title order={2}>Aikataulu - {event?.data.data.title}</Title>
      {admin && (
        <>
          <Button onClick={() => open()}>Lisää aktiviteetti</Button>
          <Modal opened={opened} onClose={close} title="Lisää" fullScreen={isMobile}>
            <ActivityForm close={close} eventObject={event?.data.data} lastDate={lastDate} />
          </Modal>
          <Modal opened={editOpened} onClose={closeEdit} title="Muokkaa" fullScreen={isMobile}>
            <ActivityForm
              close={closeEdit}
              eventObject={event?.data.data}
              activity={editedActivity}
            />
          </Modal>
        </>
      )}
      <Grid grow>
        {days.map((day: Activity[], index: number) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 3 }}>
            <Paper shadow="xs" p="sm" withBorder>
              <Title order={3}>{dayjs(day[0].startDate).format('dddd')}</Title>
              {day.map((activity: Activity) => {
                const hours = dayjs(activity.endDate).diff(dayjs(activity.startDate), 'hours') - 1;
                const dynamicHeight = Math.max(38, 38 + hours * 38);
                const active = dayjs().isBetween(activity.startDate, activity.endDate);
                let indicatorPosition: 'top-end' | 'middle-end' | 'bottom-end' = 'top-end';
                if (active) {
                  indicatorPosition = getIndicatorPosition(activity.startDate, activity.endDate);
                }
                const alert = (
                  <Alert
                    key={activity.id}
                    color={activity.color}
                    radius={0}
                    styles={{
                      root: {
                        height: dynamicHeight,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingTop: 0,
                        paddingBottom: 0,
                        borderBottom: `1px solid ${activity.color}`,
                      },
                    }}
                    title={
                      <>
                        {active && '>'}
                        {dayjs(activity.startDate).format('H:mm')} {activity.title}
                        {admin && (
                          <>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="compact-xs"
                              onClick={() => deleteActivity.mutate(activity.id)}
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
                  <Indicator key={activity.id} color="red" processing position={indicatorPosition}>
                    {alert}
                  </Indicator>
                ) : (
                  alert
                );
              })}
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
