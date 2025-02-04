import { Button, ColorPicker, Stack, Text, TextInput } from "@mantine/core";
import { DateTimePicker, DateValue } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { Updater, useForm } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
import useAddActivity from "../../api/useAddActivity.hook";
import useUpdateActivity from "../../api/useUpdateActivity.hook";
import activitySchema from "../../schemas/activitySchema";
import eventSchema from "../../schemas/eventSchema";
import roundToNearestMinute from "../../utils/roundToNearestMinute";

export default function ActivityForm({
  close,
  eventObject,
  activity,
  lastDate,
}: {
  close: () => void;
  eventObject: z.infer<typeof eventSchema>;
  activity?: z.infer<typeof activitySchema>;
  lastDate?: Date;
}) {
  const addActivity = useAddActivity();
  const updateActivity = useUpdateActivity();

  const { Field, handleSubmit } = useForm({
    defaultValues: activity
      ? {
          ...activity,
          startDate: new Date(activity.startDate),
          endDate: new Date(activity.endDate),
        }
      : {
          title: "",
          startDate: lastDate || new Date(),
          endDate: lastDate || new Date(),
          color: "#228be6",
        },
    validators: {
      onChange: activitySchema,
    },
    onSubmit: async ({ value }) => {
      const roundedValues = {
        ...value,
        startDate: roundToNearestMinute(value.startDate),
        endDate: roundToNearestMinute(value.endDate),
      };

      if (activity && activity.id) {
        updateActivity.mutate(
          {
            activityId: activity.id,
            activity: roundedValues,
          },
          {
            onSuccess: () => {
              notifications.show({
                title: "Aikataulun päivitys onnistui",
                message: "Aikataulun päivitys onnistui",
                color: "green",
              });
              close();
            },
          },
        );
      } else if (eventObject.id) {
        addActivity.mutate(
          { eventId: eventObject.id, activity: roundedValues },
          {
            onSuccess: () => {
              notifications.show({
                title: "Aikataulun lisäys onnistui",
                message: "Aikataulun lisäys onnistui",
                color: "green",
              });
              close();
            },
          },
        );
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
          name="title"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Otsikko"
              withAsterisk
            />
          )}
        />
        <Field
          name="startDate"
          children={({ state, handleChange, handleBlur }) => (
            <DateTimePicker
              defaultValue={state.value}
              onChange={(value: DateValue) => handleChange(value || new Date())}
              onBlur={handleBlur}
              label="Alkuaika"
              withAsterisk
            />
          )}
        />
        <Field
          name="endDate"
          children={({ state, handleChange, handleBlur }) => (
            <DateTimePicker
              defaultValue={state.value}
              onChange={(value: DateValue) => handleChange(value || new Date())}
              onBlur={handleBlur}
              label="Loppuaika"
              withAsterisk
            />
          )}
        />
        <Field
          name="color"
          children={({ state, handleChange, handleBlur }) => (
            <ColorPicker
              defaultValue={state.value}
              onChange={(value: string) => {
                handleChange(value);
              }}
              onBlur={handleBlur}
              format="hex"
              swatches={[
                "#2e2e2e",
                "#868e96",
                "#fa5252",
                "#e64980",
                "#be4bdb",
                "#7950f2",
                "#4c6ef5",
                "#228be6",
                "#15aabf",
                "#12b886",
                "#40c057",
                "#82c91e",
                "#fab005",
                "#fd7e14",
              ]}
            />
          )}
        />
        <Button
          type="submit"
          loading={addActivity.isPending || updateActivity.isPending}
        >
          Lähetä
        </Button>
      </Stack>
    </form>
  );
}
