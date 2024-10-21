import { IconCurrencyEuro, IconCurrencyEuroOff } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Group,
  Image,
  List,
  Loader,
  Modal,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import useAddEater from '@/api/useAddEater.hook';
import useDeleteEater from '@/api/useDeleteEater.hook';
import useDeleteMeal from '@/api/useDeleteMeal.hook';
import useGetEaters from '@/api/useGetEaters.hook';
import useGetUser from '@/api/useGetUser.hook';
import useGetUserProfiles from '@/api/useGetUserProfiles.hook';
import useUpdateEaterPaid from '@/api/useUpdateEaterPaid.hook';
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
  const updateEaterPaid = useUpdateEaterPaid();

  if (isLoadingEaters || isLoadingUsers) return <Loader />;

  const chef = users?.data.find((u: { id: number }) => u.id === meal.chefId);
  const isChef = meal.chefId === user?.data.id;
  const eater = eaters?.data.data.find((e: { eaterId: number }) => e.eaterId === user?.data.id);

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
          {eaters?.data.data.map((e: { id: number; eaterId: number; paid: number }) => {
            const eaterUser = users?.data.find((u: { id: number }) => u.id === e.eaterId);
            return (
              <List.Item key={e.id}>
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

                  {e.paid === 0 && (
                    <ThemeIcon size="sm" color="red">
                      <IconCurrencyEuroOff />
                    </ThemeIcon>
                  )}

                  {e.paid === 1 && (
                    <ThemeIcon size="sm" color="yellow">
                      <IconCurrencyEuro />
                    </ThemeIcon>
                  )}

                  {e.paid === 2 && (
                    <ThemeIcon size="sm" color="green">
                      <IconCurrencyEuro />
                    </ThemeIcon>
                  )}

                  {isChef && (
                    <>
                      {e.paid === 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() => deleteEater.mutate(e.id)}
                        >
                          Poista syöjä
                        </Button>
                      )}
                      {e.paid < 2 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="green"
                          onClick={() =>
                            updateEaterPaid.mutate(
                              {
                                mealId: meal.id,
                                eaterId: e.id,
                                paidLevel: 2,
                              },
                              {
                                onSuccess: () => {
                                  notifications.show({
                                    title: 'Maksettu',
                                    message: 'Syöjä merkattu maksetuksi',
                                    color: 'green',
                                  });
                                },
                              }
                            )
                          }
                        >
                          Merkkaa maksu
                        </Button>
                      )}
                      {e.paid > 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() =>
                            updateEaterPaid.mutate(
                              {
                                mealId: meal.id,
                                eaterId: e.id,
                                paidLevel: 0,
                              },
                              {
                                onSuccess: () => {
                                  notifications.show({
                                    title: 'Maksu poistettu',
                                    message: 'Syöjä merkattu maksamattomaksi',
                                    color: 'green',
                                  });
                                },
                              }
                            )
                          }
                        >
                          Poista maksu
                        </Button>
                      )}
                    </>
                  )}
                </Group>
              </List.Item>
            );
          })}
        </List>
      </Stack>
      <Group mt={40}>
        {eater ? (
          <>
            {eater.paid === 0 && (
              <>
                {' '}
                <Button
                  onClick={() => deleteEater.mutate(meal.id)}
                  color="red"
                  disabled={!participation}
                >
                  Poista ilmoittautuminen
                </Button>{' '}
                <Button
                  onClick={() =>
                    updateEaterPaid.mutate({ mealId: meal.id, eaterId: eater.id, paidLevel: 1 })
                  }
                >
                  Merkitse maksetuksi
                </Button>
              </>
            )}
            {eater.paid === 1 && (
              <Button
                onClick={() =>
                  updateEaterPaid.mutate({ mealId: meal.id, eaterId: eater.id, paidLevel: 0 })
                }
                color="orange"
              >
                Merkitse maksamattomaksi
              </Button>
            )}
          </>
        ) : (
          <Button onClick={() => addEater.mutate(meal.id)} disabled={!participation}>
            Ilmoittaudu syöjäksi
          </Button>
        )}
        {isChef && (
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
