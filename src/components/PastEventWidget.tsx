import {
  Accordion,
  Anchor,
  Button,
  Grid,
  Group,
  Image,
  Loader,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCurrencyEuro, IconCurrencyEuroOff } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import useGetParticipationsByEventId from "../api/useGetParticipationsByEventId.hook";
import useGetPaymentRequestsByEventId from "../api/useGetPaymentRequestsByEventId.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdatePaymentRequestAssignmentsPaid from "../api/useUpdatePaymentRequestAssignmentsPaid.hook";
import PaymentRequestModal from "../components/PaymentRequestModal";
import eventSchema from "../schemas/eventSchema";
import participationSchema from "../schemas/participationSchema";
import {
  formatCents,
  getDisplayBalances,
  getScopedPaymentAssignments,
  summarizePaymentAssignments,
  type PaymentRequest,
  type PaymentRequestRecipient,
} from "../utils/paymentRequests";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

function getPaymentState(assignments: PaymentRequestRecipient[]) {
  const activeAssignments = assignments.filter(
    (assignment) => !assignment.cancelledAt,
  );

  if (activeAssignments.length === 0) {
    return null;
  }

  if (activeAssignments.some((assignment) => assignment.paid === 0)) {
    return 0;
  }

  if (activeAssignments.some((assignment) => assignment.paid === 1)) {
    return 1;
  }

  return 2;
}

function getPositiveAssignmentIds(
  assignments: PaymentRequestRecipient[],
  predicate: (assignment: PaymentRequestRecipient) => boolean,
) {
  return assignments
    .filter(
      (assignment) =>
        !assignment.cancelledAt &&
        (assignment.amount ?? 0) >= 0 &&
        predicate(assignment),
    )
    .map((assignment) => assignment.id);
}

export default function PastEventWidget({
  event,
}: {
  event: z.infer<typeof eventSchema>;
}) {
  const { data: user } = useGetUser();
  const { data: users, isLoading: isLoadingUserProfiles } =
    useGetUserProfiles();
  const { data: participants, isLoading: isLoadingParticipants } =
    useGetParticipationsByEventId(event.id);
  const { data: paymentRequestsData, isLoading: isLoadingPaymentRequests } =
    useGetPaymentRequestsByEventId(event.id);
  const [
    paymentModalOpened,
    { open: openPaymentModal, close: closePaymentModal },
  ] = useDisclosure(false);
  const [
    refundModalOpened,
    { open: openRefundModal, close: closeRefundModal },
  ] = useDisclosure(false);
  const [refundUserId, setRefundUserId] = React.useState<number | null>(null);
  const isOrganizer = user?.data.id === event.organizer;
  const isAdmin = (user?.data.userlevel ?? 0) >= 8;
  const paymentRequests = (paymentRequestsData?.data.data ??
    []) as PaymentRequest[];
  const updateAssignmentsPaid = useUpdatePaymentRequestAssignmentsPaid();

  const participant = participants?.data.data.find(
    (p: z.infer<typeof participationSchema>) => p.userId === user?.data.id,
  );
  const participantAssignments = participant
    ? getScopedPaymentAssignments({
        paymentRequests,
        type: "event",
        userId: participant.userId,
      })
    : [];
  const participantSummary = summarizePaymentAssignments(
    participantAssignments,
  );

  if (
    isLoadingUserProfiles ||
    isLoadingParticipants ||
    isLoadingPaymentRequests
  ) {
    return <Loader />;
  }

  return (
    <Grid.Col span={6}>
      <Paper shadow="xs" p={{ base: "xs", sm: "md", lg: "xl" }}>
        <Accordion
          defaultValue={[event.title, "Osallistujat", "Toiminnot"]}
          multiple
        >
          <Accordion.Item value={event.title}>
            <Accordion.Control>
              <Title order={3}>{event.title}</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text>
                {dayjs(event.startDate).format("L LT")} -{" "}
                {dayjs(event.endDate).format("L LT")}
              </Text>
              <Text>{event.description}</Text>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Osallistujat">
            <Accordion.Control>
              Osallistujat: {participants?.data.data.length}
            </Accordion.Control>
            <Accordion.Panel>
              {(isOrganizer || isAdmin) && (
                <Button mb="md" onClick={openPaymentModal}>
                  Luo maksu
                </Button>
              )}
              <SimpleGrid spacing="xs" cols={{ base: 1, md: 2, lg: 3 }}>
                {participants?.data.data.map(
                  (p: z.infer<typeof participationSchema>) => {
                    const profile = users?.data.find(
                      (u: { id: number }) => u.id === p.userId,
                    );
                    const assignments = getScopedPaymentAssignments({
                      paymentRequests,
                      type: "event",
                      userId: p.userId,
                    });
                    const summary = summarizePaymentAssignments(assignments);
                    const displayBalances = getDisplayBalances(summary);
                    const paymentState = getPaymentState(assignments);
                    const canSeeAmounts =
                      isOrganizer || isAdmin || p.userId === user?.data.id;
                    const confirmIds = getPositiveAssignmentIds(
                      assignments,
                      (assignment) => assignment.paid < 2,
                    );
                    const resetIds = getPositiveAssignmentIds(
                      assignments,
                      (assignment) => assignment.paid > 0,
                    );

                    return (
                      <div key={p.userId}>
                        <Group wrap="wrap">
                          {profile?.avatar ? (
                            <Image
                              src={`https://cdn.discordapp.com/avatars/${profile.snowflake}/${profile.avatar}.png?size=16`}
                              fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                              alt={`${profile.nickname || profile.username} avatar`}
                              mah={16}
                              w="auto"
                              fit="contain"
                            />
                          ) : (
                            <Image
                              src="https://cdn.discordapp.com/embed/avatars/0.png"
                              alt={`${profile?.nickname || profile?.username} avatar`}
                              mah={16}
                              w="auto"
                              fit="contain"
                            />
                          )}
                          {profile?.nickname || profile?.username}

                          {paymentState === 0 && (
                            <ThemeIcon size="sm" color="red">
                              <IconCurrencyEuroOff />
                            </ThemeIcon>
                          )}
                          {paymentState === 1 && (
                            <ThemeIcon size="sm" color="yellow">
                              <IconCurrencyEuro />
                            </ThemeIcon>
                          )}
                          {paymentState === 2 && (
                            <ThemeIcon size="sm" color="green">
                              <IconCurrencyEuro />
                            </ThemeIcon>
                          )}

                          {canSeeAmounts &&
                            displayBalances.unpaidAmount > 0 && (
                              <Text size="xs" c="red.7">
                                Maksamatta{" "}
                                {formatCents(displayBalances.unpaidAmount)}
                              </Text>
                            )}
                          {canSeeAmounts &&
                            displayBalances.awaitingConfirmationAmount > 0 && (
                              <Text size="xs" c="yellow.8">
                                Odottaa vahvistusta{" "}
                                {formatCents(
                                  displayBalances.awaitingConfirmationAmount,
                                )}
                              </Text>
                            )}
                          {(isOrganizer || isAdmin) &&
                            confirmIds.length > 0 && (
                              <Button
                                size="xs"
                                variant="outline"
                                color="green"
                                onClick={() =>
                                  updateAssignmentsPaid.mutate(
                                    {
                                      ids: confirmIds,
                                      paidLevel: 2,
                                    },
                                    {
                                      onSuccess: () => {
                                        notifications.show({
                                          title: "Maksettu",
                                          message:
                                            "Osallistujan maksut merkattiin hyväksytyiksi",
                                          color: "green",
                                        });
                                      },
                                    },
                                  )
                                }
                              >
                                Vahvista maksu
                              </Button>
                            )}

                          {(isOrganizer || isAdmin) && resetIds.length > 0 && (
                            <Button
                              size="xs"
                              variant="outline"
                              color="red"
                              onClick={() =>
                                updateAssignmentsPaid.mutate(
                                  {
                                    ids: resetIds,
                                    paidLevel: 0,
                                  },
                                  {
                                    onSuccess: () => {
                                      notifications.show({
                                        title: "Maksu poistettu",
                                        message:
                                          "Osallistujan maksut palautettiin maksamattomiksi",
                                        color: "green",
                                      });
                                    },
                                  },
                                )
                              }
                            >
                              Poista maksu
                            </Button>
                          )}
                          {(isOrganizer || isAdmin) && (
                            <Button
                              size="xs"
                              variant="outline"
                              color="grape"
                              onClick={() => {
                                setRefundUserId(p.userId);
                                openRefundModal();
                              }}
                            >
                              Luo hyvitys
                            </Button>
                          )}
                        </Group>
                      </div>
                    );
                  },
                )}
              </SimpleGrid>
              {participant && participantAssignments.length > 0 && (
                <>
                  {getPositiveAssignmentIds(
                    participantAssignments,
                    (assignment) => assignment.paid === 0,
                  ).length > 0 && (
                    <Button
                      mt="xs"
                      onClick={() =>
                        updateAssignmentsPaid.mutate({
                          ids: getPositiveAssignmentIds(
                            participantAssignments,
                            (assignment) => assignment.paid === 0,
                          ),
                          paidLevel: 1,
                        })
                      }
                    >
                      Merkitse maksetuksi
                    </Button>
                  )}
                  {getPositiveAssignmentIds(
                    participantAssignments,
                    (assignment) => assignment.paid === 1,
                  ).length > 0 && (
                    <Button
                      mt="xs"
                      onClick={() =>
                        updateAssignmentsPaid.mutate({
                          ids: getPositiveAssignmentIds(
                            participantAssignments,
                            (assignment) => assignment.paid === 1,
                          ),
                          paidLevel: 0,
                        })
                      }
                      color="orange"
                    >
                      Merkitse maksamattomaksi
                    </Button>
                  )}
                  {(() => {
                    const displayBalances =
                      getDisplayBalances(participantSummary);

                    if (displayBalances.unpaidAmount > 0) {
                      return (
                        <Text mt="xs" size="sm" c="red.7">
                          Maksamatta {formatCents(displayBalances.unpaidAmount)}
                        </Text>
                      );
                    }

                    if (displayBalances.awaitingConfirmationAmount > 0) {
                      return (
                        <Text mt="xs" size="sm" c="yellow.8">
                          Odottaa vahvistusta{" "}
                          {formatCents(
                            displayBalances.awaitingConfirmationAmount,
                          )}
                        </Text>
                      );
                    }

                    return null;
                  })()}
                </>
              )}
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Toiminnot">
            <Accordion.Control>Toiminnot</Accordion.Control>
            <Accordion.Panel>
              <Group>
                {event.votingState >= 2 && (
                  <>
                    <Anchor
                      component={Link}
                      href={`/dashboard/schedule/${event.id}`}
                    >
                      Aikataulu
                    </Anchor>

                    <Anchor
                      component={Link}
                      href={`/dashboard/results/${event.id}`}
                    >
                      Peliäänestyksen tulokset
                    </Anchor>
                  </>
                )}
                <Anchor component={Link} href={`/dashboard/meals/${event.id}`}>
                  Ateriat
                </Anchor>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
      <PaymentRequestModal
        opened={paymentModalOpened}
        onClose={closePaymentModal}
        title="Luo osallistumismaksu"
        description="Pyydetään tapahtuman nykyisiltä ja tulevilta osallistujilta."
        type="event"
        eventId={event.id}
      />
      <PaymentRequestModal
        opened={refundModalOpened}
        onClose={closeRefundModal}
        title="Luo hyvitys"
        description="Hyvitys kohdistetaan valitulle osallistujalle ja merkitään heti vahvistetuksi."
        type="event"
        eventId={event.id}
        userIds={refundUserId ? [refundUserId] : []}
        forceNegative
        submitLabel="Luo hyvitys"
      />
    </Grid.Col>
  );
}
