import "@mantine/dates/styles.css";
import {
  Button,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { Updater, useForm } from "@tanstack/react-form";
import React, { useState } from "react";
import { z } from "zod";
import useAddCarpool from "../../api/useAddCarpool.hook";
import useGetUser from "../../api/useGetUser.hook";
import useUpdateCarpool from "../../api/useUpdateCarpool.hook";
import carpoolSchema from "../../schemas/carpoolSchema";
import formatFieldError from "../../utils/formatFieldError";
import roundToNearestMinute from "../../utils/roundToNearestMinute";
import validateWithZod from "../../utils/validateWithZod";

function getDateValue(value: string | null, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default function CarpoolForm({
  close,
  carpool,
  eventId,
}: {
  close: () => void;
  carpool?: z.infer<typeof carpoolSchema>;
  eventId?: number;
}) {
  const { data: user } = useGetUser();
  const addCarpool = useAddCarpool();
  const updateCarpool = useUpdateCarpool();
  const [defaultDepartureTime] = useState(() => new Date());

  const { Field, handleSubmit } = useForm({
    defaultValues: carpool
      ? { ...carpool, departureTime: new Date(carpool.departureTime) }
      : {
          eventId,
          driverId: user?.data.id,
          seats: 1,
          departureCity: "",
          departureTime: defaultDepartureTime,
          description: "",
        },
    validators: {
      onChange: validateWithZod(carpoolSchema),
    },
    onSubmit: async ({ value }) => {
      const roundedValues = {
        ...value,
        departureTime: roundToNearestMinute(value.departureTime),
      };
      if (carpool && carpool.id) {
        updateCarpool.mutate(
          {
            carpoolId: carpool.id,
            carpool: roundedValues,
          },
          {
            onSuccess: () => {
              notifications.show({
                title: "Kimppakyyti päivitetty",
                message: "Kimppakyyti on päivitetty onnistuneesti",
                color: "green",
              });
              close();
            },
          },
        );
      } else {
        addCarpool.mutate(roundedValues, {
          onSuccess: () => {
            notifications.show({
              title: "Kimppakyyti lisätty",
              message: "Kimppakyyti on lisätty onnistuneesti",
              color: "green",
            });
            close();
          },
        });
      }
    },
  });

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
          name="seats"
          children={({ state, handleChange, handleBlur }) => (
            <NumberInput
              defaultValue={state.value}
              onChange={(value: string | number) => handleChange(Number(value))}
              onBlur={handleBlur}
              label="Kyytipaikkoja"
              min={1}
              withAsterisk
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="departureCity"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Lähtökaupunki"
              withAsterisk
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="departureTime"
          children={({ state, handleChange, handleBlur }) => (
            <DateTimePicker
              value={state.value}
              onChange={(value) =>
                handleChange(getDateValue(value, state.value))
              }
              onBlur={handleBlur}
              label="Lähtöaika"
              withAsterisk
              error={formatFieldError(state.meta.errors)}
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
              label="Kuvaus"
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Button
          type="submit"
          loading={addCarpool.isPending || updateCarpool.isPending}
        >
          Lähetä
        </Button>
      </Stack>
    </form>
  );
}
