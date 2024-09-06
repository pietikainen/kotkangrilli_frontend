import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { NumberInput, Textarea, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Alert, Button, Stack } from '@mantine/core';
import useAddLocation from '@/api/useAddLocation.hook';
import locationSchema from '@/schemas/locationSchema';

export default function LocationForm({ close }: any) {
  const { control, handleSubmit } = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      capacity: 2,
      description: '',
      price: 0,
    },
  });

  const addLocation = useAddLocation();

  async function onSubmit(values: z.infer<typeof locationSchema>) {
    addLocation.mutate({
      name: values.name,
      address: values.address,
      city: values.city,
      capacity: values.capacity,
      description: values.description,
      price: values.price * 100,
    });
  }

  useEffect(() => {
    if (addLocation.isSuccess) {
      close();
    }
  }, [addLocation.isSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput name="name" control={control} label="Nimi" />
        <TextInput name="address" control={control} label="Osoite" />
        <TextInput name="city" control={control} label="Kaupunki" />
        <NumberInput name="capacity" control={control} label="Kapasiteetti" />
        <Textarea name="description" control={control} label="Kuvaus" />
        <NumberInput name="price" control={control} label="Hinta" step={0.01} />
        <Button type="submit" loading={addLocation.isPending}>
          Lähetä
        </Button>
        {isAxiosError(addLocation.error) && addLocation.error?.response && (
          <Alert
            variant="light"
            color="red"
            icon={<IconInfoCircle />}
            title={addLocation.error.response.status}
          >
            {addLocation.error.response.data.message}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
