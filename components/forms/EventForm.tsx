import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Checkbox, DateTimePicker, Textarea, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Alert, Button, Loader, Radio, Select, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useAddEvent from '@/api/useAddEvent.hook';
import useGetLocations from '@/api/useGetLocations.hook';
import useGetUsers from '@/api/useGetUsers.hook';
import useUpdateEvent from '@/api/useUpdateEvent.hook';
import eventSchema from '@/schemas/eventSchema';
import roundToNearestMinute from '@/utils/roundToNearestMinute';

export default function EventForm({
  close,
  eventObject,
}: {
  close: () => void;
  eventObject?: z.infer<typeof eventSchema>;
}) {
  const { data: users, isLoading } = useGetUsers();
  const { data: locations, isLoading: isLocationsLoading } = useGetLocations();
  const { control, handleSubmit, watch, setValue } = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventObject
      ? {
          ...eventObject,
          startDate: new Date(eventObject.startDate),
          endDate: new Date(eventObject.endDate),
        }
      : {
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
  const updateEvent = useUpdateEvent();

  async function onSubmit(values: z.infer<typeof eventSchema>) {
    if (values.lanMaster === 0) {
      values.lanMaster = undefined;
    }
    if (values.paintCompoWinner === 0) {
      values.paintCompoWinner = undefined;
    }
    if (values.organizer === 0) {
      values.organizer = undefined;
    }
    const roundedValues = {
      ...values,
      startDate: roundToNearestMinute(values.startDate),
      endDate: roundToNearestMinute(values.endDate),
    };
    if (eventObject?.id) {
      updateEvent.mutate(
        { eventId: eventObject.id, event: roundedValues },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Tapahtuma päivitetty',
              message: 'Tapahtuma on päivitetty onnistuneesti',
              color: 'green',
            });
            close();
          },
          onError: () => {
            notifications.show({
              title: 'Virhe',
              message: 'Tapahtumaa ei voitu päivittää',
              color: 'red',
            });
          },
        }
      );
    } else {
      addEvent.mutate(roundedValues, {
        onSuccess: () => {
          notifications.show({
            title: 'Tapahtuma lisätty',
            message: 'Tapahtuma on lisätty onnistuneesti',
            color: 'green',
          });
          close();
        },
        onError: () => {
          notifications.show({
            title: 'Virhe',
            message: 'Tapahtumaa ei voitu lisätä',
            color: 'red',
          });
        },
      });
    }
  }

  if (isLoading || isLocationsLoading) return <Loader />;

  const winnerGamesCount = watch('winnerGamesCount', 4);

  const selectUsers = users?.data.map((user: any) => ({
    value: String(user.id),
    label: user.username,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput name="title" control={control} label="Otsikko" withAsterisk />
        <Textarea name="description" control={control} label="Kuvaus" />
        <Select
          name="location"
          label="Paikka"
          data={locations?.data.data.map((location: any) => ({
            value: String(location.id),
            label: location.name,
          }))}
          value={String(watch('location'))}
          onChange={(selected) => setValue('location', Number(selected))}
          withAsterisk
        />
        <DateTimePicker name="startDate" control={control} label="Alkuaika" withAsterisk />
        <DateTimePicker name="endDate" control={control} label="Loppuaika" withAsterisk />
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
          label="LAN mestari"
          data={selectUsers}
          value={String(watch('lanMaster'))}
          onChange={(selected) => setValue('lanMaster', Number(selected))}
          clearable
          allowDeselect
        />
        <Select
          name="paintCompoWinner"
          label="Paint compo voittaja"
          data={selectUsers}
          value={String(watch('paintCompoWinner'))}
          onChange={(selected) => setValue('paintCompoWinner', Number(selected))}
          clearable
          allowDeselect
        />
        <Select
          name="organizer"
          label="Organisaattori"
          data={selectUsers}
          value={String(watch('organizer'))}
          onChange={(selected) => setValue('organizer', Number(selected))}
          clearable
          allowDeselect
        />
        <Button type="submit" loading={addEvent.isPending || updateEvent.isPending}>
          Lähetä
        </Button>
        {isAxiosError(addEvent.error) && addEvent.error?.response && (
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
