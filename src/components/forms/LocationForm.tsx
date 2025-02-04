import {
  Alert,
  Button,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { Updater, useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import React, { useEffect } from "react";
import useAddLocation from "../../api/useAddLocation.hook";
import locationSchema from "../../schemas/locationSchema";

export default function LocationForm({ close }: { close: () => void }) {
  const addLocation = useAddLocation();

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      capacity: 2,
      description: "",
      price: 0,
    },
    validators: {
      onChange: locationSchema,
    },
    onSubmit: async ({ value }) => {
      addLocation.mutate({
        name: value.name,
        address: value.address,
        city: value.city,
        capacity: value.capacity,
        description: value.description,
        price: value.price * 100,
      });
    },
  });

  useEffect(() => {
    if (addLocation.isSuccess) {
      close();
    }
  }, [addLocation.isSuccess]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Stack>
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
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="address"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Osoite"
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="city"
          children={({ state, handleChange, handleBlur }) => (
            <TextInput
              defaultValue={state.value}
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
              onBlur={handleBlur}
              label="Kaupunki"
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Field
          name="capacity"
          children={({ state, handleChange, handleBlur }) => (
            <NumberInput
              defaultValue={state.value}
              onChange={(value: string | number) => handleChange(Number(value))}
              onBlur={handleBlur}
              label="Kapasiteetti"
              min={2}
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
              onChange={(e: { target: { value: Updater<string> } }) =>
                handleChange(e.target.value)
              }
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
              label="Hinta"
              min={0}
              step={0.01}
              withAsterisk
              error={state.meta.errors.join(", ")}
            />
          )}
        />
        <Button type="submit" loading={addLocation.isPending}>
          Lähetä
        </Button>
        {isAxiosError(addLocation.error) && addLocation.error?.response && (
          <Alert
            variant="light"
            color="red"
            icon={<IconInfoCircle />}
            title={addLocation.error.response.status}
          >
            {addLocation.error.response.data.message}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
