import { Badge, Button, Group, Image, List, Loader, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import useAddEater from '@/api/useAddEater.hook';
import useDeleteEater from '@/api/useDeleteEater.hook';
import useDeleteMeal from '@/api/useDeleteMeal.hook';
import useGetEaters from '@/api/useGetEaters.hook';
import useGetUser from '@/api/useGetUser.hook';
import useGetUserProfiles from '@/api/useGetUserProfiles.hook';
import MealForm from '@/components/forms/MealForm';

export default function MealWidget({ meal, participation }: { meal: any; participation?: any }) {
  const { data: user } = useGetUser();
  const { data: eaters, isLoading: isLoadingEaters } = useGetEaters(meal.id);
  const { data: users, isLoading: isLoadingUsers } = useGetUserProfiles();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 50em)');

  const addEater = useAddEater();
  const deleteEater = useDeleteEater();
  const deleteMeal = useDeleteMeal();

  if (isLoadingEaters || isLoadingUsers) return <Loader />;

  const chef = users?.data.find((u: { id: number }) => u.id === meal.chefId);

  return (
    <div>
      <Stack>
        <Group>
          <h3>{meal.name}</h3>à la{' '}
          <>
            {chef?.avatar && (
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  chef?.snowflake
                }/${chef?.avatar}.png?size=32`}
                alt={`${chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            )}
            {chef?.username}
          </>
        </Group>
        {meal.description && <p>{meal.description}</p>}
        <Group>
          <span>Hinta: {meal.price / 100} €</span>
          {meal.mobilepay && <Badge color="indigo">MobilePay</Badge>}
          {meal.banktransfer && <Badge color="teal">Tilisiirto</Badge>}
        </Group>
        <span>Syöjiä: {eaters?.data.data.length}</span>
        <List>
          {eaters?.data.data.map((eater: { id: number; eaterId: number }) => {
            const eaterUser = users?.data.find((u: { id: number }) => u.id === eater.eaterId);
            return (
              <List.Item key={eater.id}>
                <Group>
                  {eaterUser?.avatar && (
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${eaterUser.snowflake}/${eaterUser.avatar}.png?size=16`}
                      alt={`${eaterUser.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  )}
                  {eaterUser?.username}
                </Group>
              </List.Item>
            );
          })}
        </List>
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
        {meal.chefId === user?.data.id && (
          <>
            <Button onClick={open} disabled={!participation}>
              Muokkaa
            </Button>
            <Button onClick={openDelete} disabled={!participation}>
              Poista
            </Button>
          </>
        )}
      </Group>
      <Modal opened={opened} onClose={close} title="Muokkaa ateriaa" fullScreen={isMobile}>
        <MealForm meal={meal} close={close} />
      </Modal>
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Poista ateria"
        fullScreen={isMobile}
      >
        <Text>Haluatko varmasti poistaa aterian?</Text>
        <h3>{meal.name}</h3>
        <span>Syöjiä: {eaters?.data.data.length}</span>
        {eaters?.data.data.length && (
          <p>
            Poistaminen ei ainakaan vielä toimi jos syöjiä on jo ilmoittautunut. Ota yhteyttä
            ylläpitoon kiitos!
          </p>
        )}
        <Group>
          <Button onClick={closeDelete}>Peruuta</Button>
          <Button
            color="red"
            onClick={() => deleteMeal.mutate(meal.id)}
            disabled={eaters?.data.data.length > 0}
          >
            Poista
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
