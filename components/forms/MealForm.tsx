import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Checkbox, NumberInput, Textarea, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useAddMeal from '@/api/useAddMeal.hook';
import useGetUser from '@/api/useGetUser.hook';
import useUpdateMeal from '@/api/useUpdateMeal.hook';
import mealSchema from '@/schemas/mealSchema';

export default function MealForm({
  close,
  meal,
  eventId,
}: {
  close: () => void;
  meal?: any;
  eventId?: number;
}) {
  const { data: user } = useGetUser();

  const { control, handleSubmit } = useForm<z.infer<typeof mealSchema>>({
    resolver: zodResolver(mealSchema),
    defaultValues: meal
      ? {
          ...meal,
          price: meal.price / 100,
        }
      : {
          eventId,
          chefId: user?.data.id,
          name: '',
          description: '',
          price: 0,
          mobilepay: true,
          banktransfer: false,
        },
  });

  const addMeal = useAddMeal();
  const updateMeal = useUpdateMeal();

  async function onSubmit(values: any) {
    const submissionValues = {
      ...values,
      price: Math.round(values.price * 100),
    };

    if (meal) {
      updateMeal.mutate(
        {
          mealId: meal.id,
          meal: submissionValues,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Ateria päivitetty',
              message: 'Ateria on päivitetty onnistuneesti',
              color: 'green',
            });
            close();
          },
        }
      );
    } else {
      addMeal.mutate(submissionValues, {
        onSuccess: () => {
          notifications.show({
            title: 'Ateria lisätty',
            message: 'Ateria on lisätty onnistuneesti',
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
        <TextInput name="name" control={control} label="Nimi" withAsterisk />
        <Textarea
          name="description"
          control={control}
          label="Kuvaus"
          description="Mainitse kuvauksessa myös kokkauspäivä"
        />
        <NumberInput name="price" control={control} label="Hinta (€)" step={0.01} withAsterisk />
        <Checkbox
          name="mobilepay"
          control={control}
          label="MobilePay"
          description="Vahva suositus"
        />
        <Checkbox
          name="banktransfer"
          control={control}
          label="Pankkitili"
          description="Valitse sitten edes tämä jos ei MobilePay kelpaa..."
        />
        <Button type="submit">Lähetä</Button>
      </Stack>
    </form>
  );
}
