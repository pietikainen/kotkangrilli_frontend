import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DateTimePicker, NumberInput, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useAddCarpool from '@/api/useAddCarpool.hook';
import useGetUser from '@/api/useGetUser.hook';
import useUpdateCarpool from '@/api/useUpdateCarpool.hook';
import carpoolSchema from '@/schemas/carpoolSchema';
import roundToNearestMinute from '@/utils/roundToNearestMinute';

export default function CarpoolForm({
  close,
  carpool,
  eventId,
}: {
  close: () => void;
  carpool?: any;
  eventId?: number;
}) {
  const { data: user } = useGetUser();

  const { control, handleSubmit } = useForm<z.infer<typeof carpoolSchema>>({
    resolver: zodResolver(carpoolSchema),
    defaultValues: carpool
      ? { ...carpool, departureTime: new Date(carpool.departureTime) }
      : {
          eventId,
          driverId: user?.data.id,
          seats: 1,
          departureCity: '',
          departureTime: new Date(),
        },
  });

  const addCarpool = useAddCarpool();
  const updateCarpool = useUpdateCarpool();

  async function onSubmit(values: any) {
    const roundedValues = {
      ...values,
      departureTime: roundToNearestMinute(values.departureTime),
    };
    if (carpool) {
      updateCarpool.mutate(
        {
          carpoolId: carpool.id,
          carpool: roundedValues,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Kimppakyyti päivitetty',
              message: 'Kimppakyyti on päivitetty onnistuneesti',
              color: 'green',
            });
            close();
          },
        }
      );
    } else {
      addCarpool.mutate(roundedValues, {
        onSuccess: () => {
          notifications.show({
            title: 'Kimppakyyti lisätty',
            message: 'Kimppakyyti on lisätty onnistuneesti',
            color: 'green',
          });
          close();
        },
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Text size="sm" c="dimmed">
          Tähdellä * merkityt kentät ovat pakollisia.
        </Text>
        <NumberInput name="seats" control={control} label="Kyytipaikkoja" min={1} withAsterisk />
        <TextInput name="departureCity" control={control} label="Lähtökaupunki" withAsterisk />
        <DateTimePicker name="departureTime" control={control} label="Lähtöaika" withAsterisk />
        <Button type="submit">Lähetä</Button>
      </Stack>
    </form>
  );
}
