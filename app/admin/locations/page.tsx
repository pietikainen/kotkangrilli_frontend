'use client';

import { Button, Group, Loader, Modal, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useGetLocations from '@/api/useGetLocations.hook';
import LocationForm from '@/components/forms/LocationForm';
import LocationTable from '@/components/tables/LocationTable';

export default function LocationsPage() {
  const { data: locations, isLoading } = useGetLocations();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Paikat</Title>
        <Button onClick={open}>Lisää paikka</Button>
      </Group>
      {isLoading ? <Loader /> : <LocationTable data={locations?.data.data} />}
      <Modal opened={opened} onClose={close} title="Paikan tiedot">
        <LocationForm close={close} />
      </Modal>
    </Stack>
  );
}
