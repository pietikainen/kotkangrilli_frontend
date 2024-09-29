import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import Link from 'next/link';
import { Accordion, Anchor, Grid, Group, Image, List, Loader, Paper } from '@mantine/core';
import useGetParticipationsByEventId from '@/api/useGetParticipationsByEventId.hook';
import useGetUserProfiles from '@/api/useGetUserProfiles.hook';

dayjs.locale('fi');
dayjs.extend(localizedFormat);

export default function EventWidget({ event }: { event: any }) {
  const { data: users, isLoading: isLoadingUserProfiles } = useGetUserProfiles();
  const { data: participants, isLoading: isLoadingParticipants } = useGetParticipationsByEventId(
    event.id
  );

  if (isLoadingUserProfiles || isLoadingParticipants) return <Loader />;

  return (
    <Grid.Col span={6}>
      <Paper shadow="xs" p={{ base: 'xs', sm: 'md', lg: 'xl' }}>
        <Accordion defaultValue={[event.title, 'Osallistujat', 'Toiminnot']} multiple>
          <Accordion.Item value={event.title}>
            <Accordion.Control>
              <h3>{event.title}</h3>
            </Accordion.Control>
            <Accordion.Panel>
              <span>
                {dayjs(event.startDate).format('L LT')} - {dayjs(event.endDate).format('L LT')}
              </span>
              <p>{event.description}</p>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Osallistujat">
            <Accordion.Control>Osallistujat: {participants?.data.data.length}</Accordion.Control>
            <Accordion.Panel>
              <List>
                {participants?.data.data.map((p: { userId: number }) => {
                  const user = users?.data.find((u: { id: number }) => u.id === p.userId);
                  return (
                    <List.Item key={p.userId}>
                      <Group>
                        {user?.avatar && (
                          <Image
                            src={`https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.png?size=16`}
                            alt={`${user.username} avatar`}
                            mah={16}
                            w="auto"
                            fit="contain"
                          />
                        )}
                        {user?.username}
                      </Group>
                    </List.Item>
                  );
                })}
              </List>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Toiminnot">
            <Accordion.Control>Toiminnot</Accordion.Control>
            <Accordion.Panel>
              <Group>
                <Anchor component={Link} href={`/dashboard/vote/${event.id}`}>
                  Äänestys
                </Anchor>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </Grid.Col>
  );
}
