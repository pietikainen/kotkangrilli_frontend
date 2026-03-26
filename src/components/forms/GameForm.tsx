import {
  Alert,
  Button,
  Checkbox,
  Loader,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons-react";
import { Updater, useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import useAddGame from "../../api/useAddGame.hook";
import useGetStoreUrl from "../../api/useGetStoreUrl.hook";
import useUpdateGame from "../../api/useUpdateGame.hook";
import gameSchema from "../../schemas/gameSchema";

const gameFormSchema = gameSchema.extend({
  voteGroup: z.string().trim().max(255),
});

function getStoreName(url: string) {
  if (url) {
    if (url.includes("steampowered.com")) return "Steam";
    if (url.includes("gog.com")) return "GOG.com";
    if (url.includes("epicgames.com")) return "Epic Games";
    if (url.includes("ubisoft.com") || url.includes("ubi.com"))
      return "Ubisoft";
    if (url.includes("xbox.com") || url.includes("microsoft.com"))
      return "Xbox";
  }
  return "Muu";
}

export default function GameForm({
  game,
  searchedGame,
  close,
  setTitle,
}: {
  game?: z.infer<typeof gameSchema>;
  searchedGame?: { id: number; coverImageUrl: string; name: string };
  close: () => void;
  setTitle?: (title: string) => void;
}) {
  const shouldAutofillStore = Boolean(searchedGame && !game);
  const { data: storeUrl, isLoading } = useGetStoreUrl(
    shouldAutofillStore ? searchedGame?.id : undefined,
  );
  const { Field, handleSubmit, setFieldValue, getFieldValue } = useForm({
    defaultValues: game
      ? { ...game, price: game.price / 100, voteGroup: game.voteGroup ?? "" }
      : {
          externalApiId: searchedGame?.id || -1,
          image: searchedGame?.coverImageUrl,
          title: searchedGame?.name || "",
          price: undefined,
          store: "Muu",
          description: "",
          link: "",
          players: undefined,
          isLan: true,
          voteGroup: "",
        },
    validators: {
      onChange: gameFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.price === undefined) {
        notifications.show({
          title: "Virhe",
          message: "Hinta ei voi olla tyhjä",
          color: "red",
        });
        return;
      }
      if (value.players === undefined) {
        notifications.show({
          title: "Virhe",
          message: "Pelaajamäärä ei voi olla tyhjä",
          color: "red",
        });
        return;
      }

      const submissionValues = {
        ...value,
        price: Math.round(value.price * 100),
        store: isNas ? "NAS" : value.store,
        voteGroup: value.voteGroup?.trim() || undefined,
      };

      if (game && game.id) {
        updateGame.mutate(
          {
            gameId: game.id,
            game: submissionValues,
          },
          {
            onSuccess: () => {
              notifications.show({
                title: "Peli päivitetty",
                message: "Peli on päivitetty onnistuneesti",
                color: "green",
              });
              close();
            },
            onError: () => {
              notifications.show({
                title: "Virhe",
                message: "Peliä ei voitu päivittää",
                color: "red",
              });
            },
          },
        );
      } else if (setTitle && submissionValues.externalApiId) {
        addGame.mutate(submissionValues, {
          onSuccess: () => {
            notifications.show({
              title: "Peli lisätty",
              message: "Peli on lisätty onnistuneesti",
              color: "green",
            });
            close();
            setIsNas(false);
            setTitle("");
          },
          onError: () => {
            notifications.show({
              title: "Virhe",
              message: "Peliä ei voitu lisätä",
              color: "red",
            });
          },
        });
      }
    },
  });
  const [isNas, setIsNas] = useState(game?.store === "NAS");

  const addGame = useAddGame();
  const updateGame = useUpdateGame();

  useEffect(() => {
    if (isNas) {
      setFieldValue("store", "NAS");
      setFieldValue("price", 0);
      if (shouldAutofillStore && storeUrl?.data.data) {
        setFieldValue("link", storeUrl.data.data);
      }
      return;
    }

    if (!shouldAutofillStore) {
      return;
    }

    if (storeUrl?.data.data) {
      setFieldValue("store", getStoreName(storeUrl.data.data));
      setFieldValue("link", storeUrl.data.data);
    } else {
      setFieldValue("store", getStoreName(getFieldValue("link")));
    }
  }, [getFieldValue, setFieldValue, shouldAutofillStore, storeUrl, isNas]);

  if (isLoading) return <Loader />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Stack>
        <Text size="sm" c="dimmed">
          Tähdellä * merkityt kentät ovat pakollisia.
        </Text>
        <Field
          name="externalApiId"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(Number(e.target.value))
              }
              onBlur={handleBlur}
              style={{ display: "none" }}
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="title"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              style={{ display: "none" }}
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="voteGroup"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              value={state.value ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Äänestysryhmä"
              description="Anna sama arvo peleille, joiden 1. kierroksen äänet halutaan yhdistää ja ratkaista myöhemmin."
              placeholder='Esim. "Battlefield"'
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="price"
          children={({ state, handleChange, handleBlur }) => (
            <NumberInput
              defaultValue={state.value}
              onChange={(value: string | number) =>
                handleChange(
                  typeof value === "string" ? parseFloat(value) : value,
                )
              }
              onBlur={handleBlur}
              label="Hinta (€)"
              description="Hinta saa olla epäilyttävästä epävirallisesta kaupasta."
              readOnly={isNas}
              styles={{
                input: {
                  cursor: isNas ? "not-allowed" : "auto",
                  opacity: isNas ? 0.6 : 1,
                },
              }}
              step={0.01}
              withAsterisk
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="store"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              value={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Kauppa"
              description={
                shouldAutofillStore
                  ? "Kauppa päätellään automaattisesti linkistä."
                  : "Ylläpitäjä voi asettaa kaupan käsin."
              }
              readOnly={shouldAutofillStore || isNas}
              style={{
                cursor: shouldAutofillStore || isNas ? "not-allowed" : "auto",
                opacity: shouldAutofillStore || isNas ? 0.6 : 1,
              }}
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="link"
          listeners={{
            onChange: ({ value }) => {
              if (isNas) {
                setFieldValue("store", "NAS");
              } else if (shouldAutofillStore) {
                setFieldValue("store", getStoreName(value));
              }
            },
          }}
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Linkki"
              description="Pelin kauppasivu, kotisivut, lataussivu tms."
              readOnly={shouldAutofillStore && storeUrl?.data.data !== ""}
              style={{
                cursor:
                  shouldAutofillStore && storeUrl?.data.data !== ""
                    ? "not-allowed"
                    : "auto",
                opacity:
                  shouldAutofillStore && storeUrl?.data.data !== "" ? 0.6 : 1,
              }}
              withAsterisk
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="description"
          children={({ state, handleChange, handleBlur }) => (
            <Textarea
              defaultValue={state.value}
              onChange={(e: {
                target: { value: Updater<string | undefined> };
              }) => handleChange(e.target.value)}
              onBlur={handleBlur}
              label="Lisätiedot/Kuvaus"
              description="Voi esimerkiksi sisältää lisätietoja mahdollisista LAN-ongelmista."
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="players"
          children={({ state, handleChange, handleBlur }) => (
            <NumberInput
              defaultValue={state.value}
              onChange={(value: string | number) =>
                handleChange(
                  typeof value === "string" ? parseFloat(value) : value,
                )
              }
              onBlur={handleBlur}
              label="Pelaajat"
              withAsterisk
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="isLan"
          children={({ state, handleChange, handleBlur }) => (
            <Checkbox
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              checked={state.value}
              label="LAN?"
              description="Älä aina luota täysin viralliseen sanaan. Kts. Wreckfest ja Natural Selection 2."
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Checkbox
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
