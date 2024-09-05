import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { Checkbox, NumberInput, Textarea, TextInput } from 'react-hook-form-mantine';
import { z } from 'zod';
import { Alert, Button, Checkbox as CheckboxM, Loader, Stack } from '@mantine/core';
import useAddGame from '@/api/useAddGame.hook';
import useGetStoreUrl from '@/api/useGetStoreUrl.hook';
import { gameSchema } from '@/schemas/game-schema';

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

export default function GameForm({ game, close, setTitle }: any) {
  const { data: storeUrl, isLoading } = useGetStoreUrl(game.id);
  const { control, handleSubmit, setValue } = useForm<z.infer<typeof gameSchema>>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      externalApiId: game.id,
      image: game.coverImageUrl,
      title: game.name,
      price: 0,
      store: '',
      description: '',
      link: '',
      players: 16,
      isLan: true,
    },
  });
  const [isNas, setIsNas] = useState(false);

  const addGame = useAddGame();

  async function onSubmit(values: z.infer<typeof gameSchema>) {
    addGame.mutate({
      externalApiId: values.externalApiId,
      title: values.title,
      image: values.image,
      price: isNas ? 0 : values.price * 100,
      link: values.link,
      store: isNas ? 'NAS' : values.store,
      players: values.players,
      isLan: values.isLan,
      description: values.description,
    });
  }

  useEffect(() => {
    if (addGame.isSuccess) {
      setIsNas(false);
      setTitle('');
      close();
    }
  }, [addGame.isSuccess]);

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
        <TextInput name="externalApiId" control={control} style={{ display: 'none' }} />
        <TextInput name="title" control={control} style={{ display: 'none' }} />
        <NumberInput
          name="price"
          control={control}
          label="Hinta (€)"
          description="Hinta voi olla epäilyttävästä epävirallisesta kaupasta."
          readOnly={isNas}
          styles={{
            input: {
              cursor: isNas ? 'not-allowed' : 'auto',
              opacity: isNas ? 0.5 : 1,
            },
          }}
          step={0.01}
        />
        <TextInput
          name="store"
          control={control}
          label="Kauppa"
          readOnly={isNas || storeUrl?.data.data !== ''}
          style={{
            cursor: isNas || storeUrl?.data.data !== '' ? 'not-allowed' : 'auto',
            opacity: isNas || storeUrl?.data.data !== '' ? 0.5 : 1,
          }}
        />
        <Textarea name="description" control={control} label="Lisätiedot/Kuvaus" />
        <TextInput
          name="link"
          control={control}
          label="Linkki"
          readOnly={isNas && storeUrl?.data.data !== ''}
          style={{
            cursor: isNas && storeUrl?.data.data !== '' ? 'not-allowed' : 'auto',
            opacity: isNas && storeUrl?.data.data !== '' ? 0.5 : 1,
          }}
        />
        <NumberInput name="players" control={control} label="Pelaajat" />
        <Checkbox
          name="isLan"
          control={control}
          label="LAN?"
          description="Älä aina luota täysin viralliseen sanaan. Kts. Wreckfest ja Natural Selection 2."
        />
        <CheckboxM
          label="Peli NASilta?"
          description='Pelin kaupaksi tulee "NAS" ja hinnaksi 0€, mutta sille luodaan silti kauppalinkki.'
          checked={isNas}
          onChange={(e) => setIsNas(e.currentTarget.checked)}
        />
        <Button type="submit" loading={addGame.isPending}>
          Lähetä
        </Button>
        {addGame.error?.response && (
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
