import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker, DateValue } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { Updater, useForm } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
import useAddMeal from "../../api/useAddMeal.hook";
import useGetUser from "../../api/useGetUser.hook";
import useUpdateMeal from "../../api/useUpdateMeal.hook";
import mealSchema from "../../schemas/mealSchema";
import roundToNearestMinute from "../../utils/roundToNearestMinute";

const dayLabels = ["Torstai", "Perjantai", "Lauantai", "Sunnuntai"];

export default function MealForm({
  close,
  meal,
  eventId,
}: {
  close: () => void;
  meal?: z.infer<typeof mealSchema>;
  eventId?: number;
}) {
  const { data: user } = useGetUser();

  const addMeal = useAddMeal();
  const updateMeal = useUpdateMeal();

  const { Field, handleSubmit } = useForm({
    defaultValues: meal
      ? {
          ...meal,
          price: meal.price / 100,
          signupEnd: new Date(meal.signupEnd),
        }
      : {
          eventId,
          chefId: user?.data.id,
          name: "",
          description: "",
          price: 0,
          mobilepay: true,
          banktransfer: false,
          signupEnd: new Date(),
          days: [],
        },
    validators: {
      onChange: mealSchema,
    },
    onSubmit: async ({ value }) => {
      const submissionValues = {
        ...value,
        price: Math.round(value.price * 100),
        signupEnd: roundToNearestMinute(value.signupEnd),
      };

      if (meal && meal.id) {
        updateMeal.mutate(
          {
            mealId: meal.id,
            meal: submissionValues,
          },
          {
            onSuccess: () => {
              notifications.show({
                title: "Ateria päivitetty",
                message: "Ateria on päivitetty onnistuneesti",
                color: "green",
              });
              close();
            },
          },
        );
      } else {
        addMeal.mutate(submissionValues, {
          onSuccess: () => {
            notifications.show({
              title: "Ateria lisätty",
              message: "Ateria on lisätty onnistuneesti",
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
          name="name"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Nimi"
              withAsterisk
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="signupEnd"
          children={({ state, handleChange, handleBlur }) => (
            <DateTimePicker
              defaultValue={state.value}
              onChange={(value: DateValue) => handleChange(value || new Date())}
              onBlur={handleBlur}
              label="Ilmoittautuminen päättyy"
              withAsterisk
              error={state.meta.errors.join(", ")}
              highlightToday
            />
          )}
        />
        <Field
          name="days"
          children={({ state, handleChange, handleBlur }) => (
            <Checkbox.Group
              label="Tarjoilupäivät"
              defaultValue={state.value.map(String)}
              onChange={(values) => handleChange(values.map(Number))}
              onBlur={handleBlur}
              withAsterisk
            >
              <Group mt="xs">
                {dayLabels.map((label, index) => (
                  <Checkbox key={index} value={String(index)} label={label} />
                ))}
              </Group>
            </Checkbox.Group>
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
              min={0}
              step={0.01}
              withAsterisk
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="mobilepay"
          children={({ state, handleChange, handleBlur }) => (
            <Checkbox
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              checked={state.value}
              label="MobilePay"
              description="Vahva suositus"
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="banktransfer"
          children={({ state, handleChange, handleBlur }) => (
            <Checkbox
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              checked={state.value}
              label="Pankkitili"
              description="Valitse sitten edes tämä jos ei MobilePay kelpaa..."
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Button
          type="submit"
          loading={addMeal.isPending || updateMeal.isPending}
        >
          Lähetä
        </Button>
      </Stack>
    </form>
  );
}
