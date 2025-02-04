import { Button, Group, SegmentedControl } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import React, { useState } from "react";
import { z } from "zod";
import useAddParticipation from "../../api/useAddParticipation.hook";
import useUpdateParticipation from "../../api/useUpdateParticipation.hook";
import eventSchema from "../../schemas/eventSchema";

export default function ParticipationForm({
  lanEvent,
  close,
  participationId,
}: {
  lanEvent: z.infer<typeof eventSchema>;
  close: () => void;
  participationId?: number;
}) {
  const [arrivalDate, setArrivalDate] = useState(0);

  const addParticipation = useAddParticipation();
  const updateParticipation = useUpdateParticipation();

  function onAddParticipation() {
    if (!lanEvent.id) return;

    addParticipation.mutate(
      {
        eventId: lanEvent.id,
        arrivalDate: dayjs(lanEvent.startDate)
          .add(arrivalDate, "day")
          .toString(),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Ilmoittautuminen onnistui",
            message: "Ilmoittautuminen onnistui",
            color: "green",
          });
          close();
        },
        onError: () => {
          notifications.show({
            title: "Ilmoittautuminen epäonnistui",
            message: "Ilmoittautuminen epäonnistui",
            color: "red",
          });
        },
      },
    );
  }

  function onUpdateParticipation() {
    if (!lanEvent.id || !participationId) return;

    updateParticipation.mutate(
      {
        id: participationId,
        arrivalDate: dayjs(lanEvent.startDate)
          .add(arrivalDate, "day")
          .toString(),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Ilmoittautuminen päivitetty",
            message: "Ilmoittautuminen päivitetty onnistuneesti",
            color: "green",
          });
          close();
        },
        onError: () => {
          notifications.show({
            title: "Päivitys epäonnistui",
            message: "Ilmoittautumisen päivitys epäonnistui",
            color: "red",
          });
        },
      },
    );
  }

  return (
    <div>
      <h3>{lanEvent.title}</h3>
      <h4>Saapumispäivä</h4>
      <SegmentedControl
        value={String(arrivalDate)}
        onChange={(val) => setArrivalDate(Number(val))}
        data={[
          {
            label: "Torstai",
            value: "0",
          },
          {
            label: "Perjantai",
            value: "1",
          },
          {
            label: "Lauantai",
            value: "2",
          },
        ]}
      />
      <Group mt={40}>
        {participationId ? (
          <Button onClick={onUpdateParticipation}>
            Päivitä ilmoittautuminen
          </Button>
        ) : (
          <Button onClick={onAddParticipation}>Ilmoittaudu</Button>
        )}
        <Button onClick={close} variant="default">
          Peruuta
        </Button>
      </Group>
    </div>
  );
}
