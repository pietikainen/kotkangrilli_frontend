import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { Checkbox, DateTimePicker, Select, Textarea, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Alert, Button, Loader, Radio, Stack } from '@mantine/core';
import useAddEvent from '@/api/useAddEvent.hook';
import useGetLocations from '@/api/useGetLocations.hook';
import useGetUsers from '@/api/useGetUsers.hook';
import { eventSchema } from '@/schemas/event-chema';

export default function EventForm({ close }: any) {
  const { data: users, isLoading } = useGetUsers();
  const { data: locations, isLoading: isLocationsLoading } = useGetLocations();
  const { control, handleSubmit, watch, setValue } = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: undefined,
      startDate: new Date(),
      endDate: new Date(),
      winnerGamesCount: 4,
      votingOpen: false,
      active: false,
      lanMaster: undefined,
      paintCompoWinner: undefined,
      organizer: undefined,
    },
  });

  const addEvent = useAddEvent();

  async function onSubmit(values: z.infer<typeof eventSchema>) {
    addEvent.mutate({
      title: values.title,
      description: values.description,
      location: values.location,
      startDate: values.startDate,
      endDate: values.endDate,
      winnerGamesCount: values.winnerGamesCount,
      votingOpen: values.votingOpen,
      active: values.active,
      lanMaster: values.lanMaster,
      paintCompoWinner: values.paintCompoWinner,
      organizer: values.organizer,
    });
  }

  useEffect(() => {
    if (addEvent.isSuccess) {
      close();
    }
  }, [addEvent.isSuccess]);

  if (isLoading || isLocationsLoading) return <Loader />;

  const winnerGamesCount = watch('winnerGamesCount', 4);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput name="title" control={control} label="Otsikko" />
        <Textarea name="description" control={control} label="Kuvaus" />
        <Select
          name="location"
          control={control}
          label="Paikka"
          data={locations?.data.data.map((location: any) => ({
            value: String(location.id),
            label: location.name,
          }))}
        />
        <DateTimePicker name="startDate" control={control} label="Alkuaika" />
        <DateTimePicker name="endDate" control={control} label="Loppuaika" />
        <Radio.Group
          label="Pelien määrä"
          value={String(winnerGamesCount)}
          onChange={(value) => setValue('winnerGamesCount', Number(value))}
        >
          <Radio value="3" label="3" />
          <Radio value="4" label="4" />
          <Radio value="5" label="5" />
        </Radio.Group>
        <Checkbox name="votingOpen" control={control} label="Äänestys auki" />
        <Checkbox name="active" control={control} label="Aktiivinen" />
        <Select
          name="lanMaster"
          control={control}
          label="LAN mestart"
          data={users?.data.map((user: any) => ({
            value: String(user.id),
            label: user.username,
          }))}
        />
        <Select
          name="paintCompoWinner"
          control={control}
          label="Paint compou winner"
          data={users?.data.map((user: any) => ({
            value: String(user.id),
            label: user.username,
          }))}
        />
        <Select
          name="organizer"
          control={control}
          label="Organisaattori"
          data={users?.data.map((user: any) => ({
            value: String(user.id),
            label: user.username,
          }))}
        />
        <Button type="submit" loading={addEvent.isPending}>
          Lähetä
        </Button>
        {addEvent.error?.response && (
          <Alert
            variant="light"
            color="red"
            icon={<IconInfoCircle />}
            title={addEvent.error.response.status}
          >
            {addEvent.error.response.data.message}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
