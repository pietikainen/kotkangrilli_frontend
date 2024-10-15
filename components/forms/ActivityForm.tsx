import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ColorPicker, DateTimePicker, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useAddActivity from '@/api/useAddActivity.hook';
import useUpdateActivity from '@/api/useUpdateActivity.hook';
import activitySchema from '@/schemas/activitySchema';
import roundToNearestMinute from '@/utils/roundToNearestMinute';

export default function ActivityForm({
  close,
  eventObject,
  activity,
  lastDate,
}: {
  close: () => void;
  eventObject: any;
  activity?: any;
  lastDate?: Date;
}) {
  const addActivity = useAddActivity();
  const updateActivity = useUpdateActivity();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          ...activity,
          startDate: new Date(activity.startDate),
          endDate: new Date(activity.endDate),
        }
      : {
          title: '',
          startDate: lastDate,
          endDate: lastDate,
          color: '#228be6',
        },
  });

  async function onSubmit(values: any) {
    const roundedValues = {
      ...values,
      startDate: roundToNearestMinute(values.startDate),
      endDate: roundToNearestMinute(values.endDate),
    };

    if (activity) {
      updateActivity.mutate(
        {
          activityId: activity.id,
          activity: roundedValues,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Aikataulun päivitys onnistui',
              message: 'Aikataulun päivitys onnistui',
              color: 'green',
            });
            close();
          },
        }
      );
    } else {
      addActivity.mutate(
        { eventId: eventObject.id, activity: roundedValues },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Aikataulun lisäys onnistui',
              message: 'Aikataulun lisäys onnistui',
              color: 'green',
            });
            close();
          },
        }
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Text size="sm" c="dimmed">
          Tähdellä * merkityt kentät ovat pakollisia.
        </Text>
        <TextInput name="title" control={control} label="Otsikko" withAsterisk />
        <DateTimePicker name="startDate" control={control} label="Alkuaika" withAsterisk />
        <DateTimePicker name="endDate" control={control} label="Loppuaika" withAsterisk />
        <ColorPicker
          name="color"
          control={control}
          format="hex"
          swatches={[
            '#2e2e2e',
            '#868e96',
            '#fa5252',
            '#e64980',
            '#be4bdb',
            '#7950f2',
            '#4c6ef5',
            '#228be6',
            '#15aabf',
            '#12b886',
            '#40c057',
            '#82c91e',
            '#fab005',
            '#fd7e14',
          ]}
        />
        {errors.color && <Text>{errors.color.message}</Text>}
        <Button type="submit">Lähetä</Button>
      </Stack>
    </form>
  );
}
