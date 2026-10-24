import { Button, Group, Modal, Text, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import React from "react";
import { z } from "zod";
import useDeleteParticipation from "../api/useDeleteParticipation.hook";
import useGetParticipationsByEventId from "../api/useGetParticipationsByEventId.hook";
import useGetPaymentRequestsByEventId from "../api/useGetPaymentRequestsByEventId.hook";
import useGetUser from "../api/useGetUser.hook";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import { getVotingState } from "../utils/getVotingState";
import { type PaymentRequest } from "../utils/paymentRequests";
import EventCard from "./EventCard";
import classes from "./EventCard.module.css";
import EventParticipants from "./EventParticipants";
import ParticipationForm from "./forms/ParticipationForm";

export default function UpcomingEventCard({
  lanEvent,
  locations,
}: {
  lanEvent: z.infer<typeof eventSchema>;
  locations: z.infer<typeof locationSchema>[];
}) {
  const { data: user } = useGetUser();
  const { data: participations } = useGetParticipationsByEventId(lanEvent.id);
  const { data: paymentRequestsData } = useGetPaymentRequestsByEventId(
    lanEvent.id,
  );
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");
  const isAdmin = (user?.data.userlevel ?? 0) >= 8;

  const deleteParticipation = useDeleteParticipation();
  const selfParticipation = participations?.data.data.find(
    (p: { id: number; userId: number }) => p.userId === user?.data.id,
  );
  const paymentRequests = (paymentRequestsData?.data.data ??
    []) as PaymentRequest[];
  const hasEventPaymentRequests = paymentRequests.some(
    (paymentRequest) => paymentRequest.type === "event",
  );

  function onDeleteParticipation() {
    deleteParticipation.mutate(selfParticipation?.id, {
      onSuccess: () => {
        notifications.show({
          title: "Ilmoittautuminen peruttu",
          message: "Ilmoittautuminen peruttu",
          color: "green",
        });
        closeDelete();
      },
      onError: () => {
        notifications.show({
          title: "Ilmoittautumisen peruminen epäonnistui",
          message: "Ilmoittautumisen peruminen epäonnistui",
          color: "red",
        });
      },
    });
  }

  return (
    <EventCard
      lanEvent={lanEvent}
      locations={locations}
      footer={!selfParticipation && <EventParticipants eventId={lanEvent.id} />}
    >
      <div>
        <Text size="sm" fw={600}>
          Äänestyksen tila
        </Text>
        <Text>{getVotingState(lanEvent.votingState)}</Text>
      </div>
      {!participations?.data.data.some(
        (p: { userId: number }) => p.userId === user?.data.id,
      ) ? (
        <>
          <Button
            onClick={open}
            className={classes.action}
            classNames={{ label: classes.actionLabel }}
          >
            Ilmoittaudu
          </Button>
          <Modal
            opened={opened}
            onClose={close}
            title="Ilmoittautuminen"
            fullScreen={isMobile}
            transitionProps={{ transition: "fade", duration: 200 }}
          >
            <ParticipationForm lanEvent={lanEvent} close={close} />
          </Modal>
        </>
      ) : (
        <>
          <Button
            className={classes.action}
            classNames={{ label: classes.actionLabel }}
            onClick={openDelete}
            disabled={hasEventPaymentRequests && !isAdmin}
          >
            Peru ilmoittautuminen
          </Button>
          <Modal
            opened={deleteOpened}
            onClose={closeDelete}
            title="Peru ilmoittautuminen"
            fullScreen={isMobile}
            transitionProps={{
              transition: "fade",
              duration: 200,
            }}
          >
            <Title order={3}>{lanEvent.title}</Title>
            <Text>
              Haluatko varmasti perua ilmoittautumisen? Tämä toiminto poistaa
              myös annetut peliäänesi.
            </Text>
            {hasEventPaymentRequests && !isAdmin && (
              <Text c="red" mt="sm">
                Ilmoittautumista ei voi perua itse, koska tapahtumalle on jo
                luotu maksuja.
              </Text>
            )}
            <Group mt={40}>
              <Button
                onClick={onDeleteParticipation}
                color="red"
                disabled={hasEventPaymentRequests && !isAdmin}
              >
                Peru ilmoittautuminen
              </Button>
              <Button onClick={closeDelete} variant="default">
                Peruuta
              </Button>
            </Group>
          </Modal>
        </>
      )}
    </EventCard>
  );
}
