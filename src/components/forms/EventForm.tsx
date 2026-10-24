import {
  Alert,
  Button,
  Checkbox,
  Loader,
  Radio,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons-react";
import { Updater, useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import React, { useState } from "react";
import { z } from "zod";
import useAddEvent from "../../api/useAddEvent.hook";
import useGetLocations from "../../api/useGetLocations.hook";
import useGetUsers from "../../api/useGetUsers.hook";
import useUpdateEvent from "../../api/useUpdateEvent.hook";
import eventSchema from "../../schemas/eventSchema";
import locationSchema from "../../schemas/locationSchema";
import userSchema from "../../schemas/userSchema";
import formatFieldError from "../../utils/formatFieldError";
import { votingStates } from "../../utils/getVotingState";
import roundToNearestMinute from "../../utils/roundToNearestMinute";
import validateWithZod from "../../utils/validateWithZod";

function getDateValue(value: string | null, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default function EventForm({
  close,
  eventObject,
}: {
  close: () => void;
  eventObject?: z.infer<typeof eventSchema>;
}) {
  const { data: users, isLoading } = useGetUsers();
  const { data: locations, isLoading: isLocationsLoading } = useGetLocations();
  const [defaultDate] = useState(() => new Date());
  const { Field, handleSubmit } = useForm({
    defaultValues: eventObject
      ? {
          ...eventObject,
          startDate: new Date(eventObject.startDate),
          endDate: new Date(eventObject.endDate),
        }
      : {
          title: "",
          description: "",
          location: undefined,
          startDate: defaultDate,
          endDate: defaultDate,
          winnerGamesCount: 4,
          votingState: 0,
          active: false,
          lanMaster: undefined,
          paintCompoWinner: undefined,
          organizer: undefined,
        },
    validators: {
      onChange: validateWithZod(eventSchema),
    },
    onSubmit: async ({ value }) => {
      if (value.lanMaster === 0) {
        value.lanMaster = undefined;
      }
      if (value.paintCompoWinner === 0) {
        value.paintCompoWinner = undefined;
      }
      if (value.organizer === 0) {
        value.organizer = undefined;
      }
      const roundedValues = {
        ...value,
        startDate: roundToNearestMinute(value.startDate),
        endDate: roundToNearestMinute(value.endDate),
      };
      if (eventObject?.id && roundedValues.location) {
        updateEvent.mutate(
          { eventId: eventObject.id, event: roundedValues },
          {
            onSuccess: () => {
              notifications.show({
                title: "Tapahtuma päivitetty",
                message: "Tapahtuma on päivitetty onnistuneesti",
                color: "green",
              });
              close();
            },
            onError: () => {
              notifications.show({
                title: "Virhe",
                message: "Tapahtumaa ei voitu päivittää",
                color: "red",
              });
            },
          },
        );
      } else if (roundedValues.location) {
        addEvent.mutate(roundedValues, {
          onSuccess: () => {
            notifications.show({
              title: "Tapahtuma lisätty",
              message: "Tapahtuma on lisätty onnistuneesti",
              color: "green",
            });
            close();
          },
          onError: () => {
            notifications.show({
              title: "Virhe",
              message: "Tapahtumaa ei voitu lisätä",
              color: "red",
            });
          },
        });
      }
    },
  });

  const addEvent = useAddEvent();
  const updateEvent = useUpdateEvent();

  if (isLoading || isLocationsLoading) return <Loader />;

  const selectUsers = users?.data.map((user: z.infer<typeof userSchema>) => ({
    value: String(user.id),
    label: user.username,
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Stack>
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

        <Field
          name="location"
          children={({ state, handleChange, handleBlur }) => (
            <Select
              defaultValue={
                typeof state.value === "number"
                  ? state.value.toString()
                  : undefined
              }
              label="Paikka"
              data={locations?.data.data.map(
                (location: z.infer<typeof locationSchema>) => ({
                  value: String(location.id),
                  label: location.name,
                }),
              )}
              onChange={(selected) => handleChange(Number(selected))}
              onBlur={handleBlur}
              withAsterisk
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="startDate"
          children={({ state, handleChange, handleBlur }) => (
            <DateTimePicker
              value={state.value}
              onChange={(value) =>
                handleChange(getDateValue(value, state.value))
              }
              onBlur={handleBlur}
              label="Alkuaika"
              withAsterisk
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="endDate"
          children={({ state, handleChange, handleBlur }) => (
            <DateTimePicker
              value={state.value}
              onChange={(value) =>
                handleChange(getDateValue(value, state.value))
              }
              onBlur={handleBlur}
              label="Loppuaika"
              withAsterisk
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="winnerGamesCount"
          children={({ state, handleChange, handleBlur }) => (
            <Radio.Group
              defaultValue={state.value.toString()}
              label="Pelien määrä"
              onChange={(value) => handleChange(Number(value))}
              onBlur={handleBlur}
              error={formatFieldError(state.meta.errors)}
            >
              <Radio value="3" label="3" />
              <Radio value="4" label="4" />
              <Radio value="5" label="5" />
            </Radio.Group>
          )}
        />
        <Field
          name="votingState"
          children={({ state, handleChange, handleBlur }) => (
            <Select
              defaultValue={
                typeof state.value === "number"
                  ? state.value.toString()
                  : undefined
              }
              label="Äänestys auki"
              data={votingStates}
              onChange={(selected) => handleChange(Number(selected))}
              onBlur={handleBlur}
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="active"
          children={({ state, handleChange, handleBlur }) => (
            <Checkbox
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              checked={state.value}
              label="Aktiivinen"
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="lanMaster"
          children={({ state, handleChange, handleBlur }) => (
            <Select
              defaultValue={
                typeof state.value === "number"
                  ? state.value.toString()
                  : undefined
              }
              label="LAN mestari"
              data={selectUsers}
              onChange={(selected) => handleChange(Number(selected))}
              onBlur={handleBlur}
              clearable
              allowDeselect
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="paintCompoWinner"
          children={({ state, handleChange, handleBlur }) => (
            <Select
              defaultValue={
                typeof state.value === "number"
                  ? state.value.toString()
                  : undefined
              }
              label="Paint compo voittaja"
              data={selectUsers}
              onChange={(selected) => handleChange(Number(selected))}
              onBlur={handleBlur}
              clearable
              allowDeselect
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Field
          name="organizer"
          children={({ state, handleChange, handleBlur }) => (
            <Select
              defaultValue={
                typeof state.value === "number"
                  ? state.value.toString()
                  : undefined
              }
              label="Tilavastaava"
              data={selectUsers}
              onChange={(selected) => handleChange(Number(selected))}
              onBlur={handleBlur}
              clearable
              allowDeselect
              error={formatFieldError(state.meta.errors)}
            />
          )}
        />
        <Button
          type="submit"
          loading={addEvent.isPending || updateEvent.isPending}
        >
          Lähetä
        </Button>
        {isAxiosError(addEvent.error) && addEvent.error?.response && (
          <Alert
            variant="light"
            color="red"
            icon={<IconInfoCircle />}
            title={addEvent.error.response.status}
          >
            {addEvent.error.response.data.message}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
