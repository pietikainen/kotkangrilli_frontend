import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Checkbox, NumberInput, Textarea, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Alert, Button, Checkbox as CheckboxM, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useAddGame from '@/api/useAddGame.hook';
import useGetStoreUrl from '@/api/useGetStoreUrl.hook';
import useUpdateGame from '@/api/useUpdateGame.hook';
import gameSchema from '@/schemas/gameSchema';

function getStoreName(url: string) {
  if (url) {
    if (url.includes('steampowered.com')) return 'Steam';
    if (url.includes('gog.com')) return 'GOG.com';
    if (url.includes('epicgames.com')) return 'Epic Games';
    if (url.includes('ubisoft.com') || url.includes('ubi.com')) return 'Ubisoft';
    if (url.includes('xbox.com') || url.includes('microsoft.com')) return 'Xbox';
  }
  return 'Tuntematon';
}

export default function GameForm({ game, searchedGame, close, setTitle }: any) {
  const { data: storeUrl, isLoading } = useGetStoreUrl(searchedGame?.id || game?.externalApiId);
  const { control, handleSubmit, setValue } = useForm<z.infer<typeof gameSchema>>({
    resolver: zodResolver(gameSchema),
    defaultValues: game
      ? { ...game, price: game.price / 100 }
      : {
          externalApiId: searchedGame.id,
          image: searchedGame.coverImageUrl,
          title: searchedGame.name,
          price: 0,
          store: '',
          description: '',
          link: '',
          players: 16,
          isLan: true,
        },
  });
  const [isNas, setIsNas] = useState(game?.store === 'NAS');

  const addGame = useAddGame();
  const updateGame = useUpdateGame();

  async function onSubmit(values: z.infer<typeof gameSchema>) {
    const submissionValues = {
      ...values,
      price: Math.round(values.price * 100),
      store: isNas ? 'NAS' : values.store,
    };

    if (game) {
      updateGame.mutate(
        {
          gameId: game.id,
          game: submissionValues,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Peli päivitetty',
              message: 'Peli on päivitetty onnistuneesti',
              color: 'green',
            });
            close();
          },
          onError: () => {
            notifications.show({
              title: 'Virhe',
              message: 'Peliä ei voitu päivittää',
              color: 'red',
            });
          },
        }
      );
    } else {
      addGame.mutate(submissionValues, {
        onSuccess: () => {
          notifications.show({
            title: 'Peli lisätty',
            message: 'Peli on lisätty onnistuneesti',
            color: 'green',
          });
          close();
          setIsNas(false);
          setTitle('');
        },
        onError: () => {
          notifications.show({
            title: 'Virhe',
            message: 'Peliä ei voitu lisätä',
            color: 'red',
          });
        },
      });
    }
  }

  useEffect(() => {
    if (isNas) {
      setValue('store', 'NAS');
      setValue('price', 0);
    }
    if (storeUrl?.data.data && !isNas) {
      setValue('store', getStoreName(storeUrl.data.data));
      setValue('link', storeUrl.data.data);
    }
    if (storeUrl?.data.data && isNas) {
      setValue('store', 'NAS');
      setValue('link', storeUrl.data.data);
    }
  }, [storeUrl, isNas]);

  if (isLoading) return <Loader />;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Text size="sm" c="dimmed">
          Tähdellä * merkityt kentät ovat pakollisia.
        </Text>
        <TextInput name="externalApiId" control={control} style={{ display: 'none' }} />
        <TextInput name="title" control={control} style={{ display: 'none' }} />
        <NumberInput
          name="price"
          control={control}
          label="Hinta (€)"
          description="Hinta saa olla epäilyttävästä epävirallisesta kaupasta."
          readOnly={isNas}
          styles={{
            input: {
              cursor: isNas ? 'not-allowed' : 'auto',
              opacity: isNas ? 0.5 : 1,
            },
          }}
          step={0.01}
          withAsterisk
        />
        <TextInput
          name="store"
          control={control}
          label="Kauppa"
          description="Hinnasta riippumaton virallinen kauppa, ehkä enemmänkin mistä peli ladataan."
          readOnly={isNas || storeUrl?.data.data !== ''}
          style={{
            cursor: isNas || storeUrl?.data.data !== '' ? 'not-allowed' : 'auto',
            opacity: isNas || storeUrl?.data.data !== '' ? 0.5 : 1,
          }}
          withAsterisk
        />
        <TextInput
          name="link"
          control={control}
          label="Linkki"
          description="Virallinen kauppa tai kotisivut mistä peli ladataan."
          readOnly={storeUrl?.data.data !== ''}
          style={{
            cursor: storeUrl?.data.data !== '' ? 'not-allowed' : 'auto',
            opacity: storeUrl?.data.data !== '' ? 0.5 : 1,
          }}
          withAsterisk
        />
        <Textarea
          name="description"
          control={control}
          label="Lisätiedot/Kuvaus"
          description="Voi esimerkiksi sisältää lisätietoja mahdollisista LAN-ongelmista."
        />
        <NumberInput name="players" control={control} label="Pelaajat" withAsterisk />
        <Checkbox
          name="isLan"
          control={control}
          label="LAN?"
          description="Älä aina luota täysin viralliseen sanaan. Kts. Wreckfest ja Natural Selection 2."
        />
        <CheckboxM
          label="Peli NASilta?"
          description='Pelin kaupaksi tulee "NAS" ja hinnaksi 0€, mutta sille saattaa silti löytyä kauppalinkki.'
          checked={isNas}
          onChange={(e) => setIsNas(e.currentTarget.checked)}
        />
        <Button type="submit" loading={addGame.isPending}>
          Lähetä
        </Button>
        {isAxiosError(addGame.error) && addGame.error?.response && (
          <Alert
            variant="light"
            color="red"
            icon={<IconInfoCircle />}
            title={addGame.error.response.status}
          >
            {addGame.error.response.data.message}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
