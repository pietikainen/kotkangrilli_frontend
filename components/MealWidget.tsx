import { Button, Group, Loader, Stack } from '@mantine/core';
import useAddEater from '@/api/useAddEater.hook';
import useDeleteEater from '@/api/useDeleteEater.hook';
import useGetEaters from '@/api/useGetEaters.hook';
import useGetUser from '@/api/useGetUser.hook';

export default function MealWidget({ meal, participation }: { meal: any; participation?: any }) {
  const { data: user } = useGetUser();
  const { data: eaters, isLoading: isLoadingEaters } = useGetEaters(meal.id);

  const addEater = useAddEater();
  const deleteEater = useDeleteEater();

  if (isLoadingEaters) return <Loader />;

  return (
    <div>
      <Stack>
        <h3>{meal.name}</h3>
        {meal.description && <p>{meal.description}</p>}
        <span>Hinta: {meal.price / 100} €</span>
        <span>Syöjiä: {eaters?.data.data.length}</span>
      </Stack>
      <Group mt={40}>
        {eaters?.data.data.find((eater: { eaterId: number }) => eater.eaterId === user?.data.id) ? (
          <Button onClick={() => deleteEater.mutate(meal.id)} color="red" disabled={!participation}>
            Poista ilmoittautuminen
          </Button>
        ) : (
          <Button onClick={() => addEater.mutate(meal.id)} disabled={!participation}>
            Ilmoittaudu syöjäksi
          </Button>
        )}
      </Group>
    </div>
  );
}
