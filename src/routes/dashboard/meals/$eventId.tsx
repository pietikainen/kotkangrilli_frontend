import {
  Button,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";
import useGetEvent from "../../../api/useGetEvent.hook";
import useGetMeals from "../../../api/useGetMeals.hook";
import useGetParticipationsByEventId from "../../../api/useGetParticipationsByEventId.hook";
import useGetUser from "../../../api/useGetUser.hook";
import MealForm from "../../../components/forms/MealForm";
import MealWidget from "../../../components/MealWidget";
import mealSchema from "../../../schemas/mealSchema";

export const Route = createFileRoute("/dashboard/meals/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Number(Route.useParams().eventId);
  const { data: user } = useGetUser();
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId);
  const { data: meals, isLoading: isLoadingMeals } = useGetMeals(eventId);
  const { data: participations, isLoading: isLoadingParticipations } =
    useGetParticipationsByEventId(eventId);
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");

  if (isLoadingEvent || isLoadingMeals || isLoadingParticipations)
    return <Loader />;

  const participation = participations?.data.data.find(
    (p: { userId: number }) => p.userId === user?.data.id,
  );

  return (
    <>
      <Title order={2}>Ateriat - {event?.data.data.title}</Title>
      <Group>
        {!participation && (
          <Text>
            Voit lisätä aterioita tai ilmoittautua syöjäksi ilmoittautumisen
            jälkeen.
          </Text>
        )}
        <Button onClick={open} disabled={!participation}>
          Lisää ateria
        </Button>
      </Group>
      <Modal
        opened={opened}
        onClose={close}
        title="Aterian tiedot"
        fullScreen={isMobile}
      >
        <MealForm close={close} eventId={eventId} />
      </Modal>
      <Grid grow>
        {meals?.data.data.map((meal: z.infer<typeof mealSchema>) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={meal.id}>
            <Paper shadow="sm" p={{ base: "xs", sm: "md", lg: "xl" }}>
              <MealWidget meal={meal} participation={participation} />
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
