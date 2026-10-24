import {
  Accordion,
  Anchor,
  Button,
  Grid,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarEvent,
  IconCurrencyEuro,
  IconCurrencyEuroOff,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import useGetLocations from "../api/useGetLocations.hook";
import useGetMyPaymentRequests from "../api/useGetMyPaymentRequests.hook";
import useGetParticipationsByEventId from "../api/useGetParticipationsByEventId.hook";
import useGetPaymentRequestsByEventId from "../api/useGetPaymentRequestsByEventId.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdatePaymentRequestAssignmentsPaid from "../api/useUpdatePaymentRequestAssignmentsPaid.hook";
import PaymentRequestModal from "../components/PaymentRequestModal";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import participationSchema from "../schemas/participationSchema";
import {
  formatCents,
  getScopedPaymentAssignments,
  getVisiblePaymentAssignmentAmounts,
  getVisiblePaymentAssignmentState,
  getVisiblePositivePaymentAssignmentIds,
  type PaymentRequest,
  type PaymentRequestRecipient,
} from "../utils/paymentRequests";
import SectionPanel from "./SectionPanel";
import User from "./User";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

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

export default function EventWidget({
  event,
}: {
  event: z.infer<typeof eventSchema>;
}) {
  const { data: user } = useGetUser();
  const { data: locations, isLoading: isLoadingLocations } = useGetLocations();
  const location = locations?.data.data.find(
    (item: z.infer<typeof locationSchema>) => item.id === event.location,
  );
  const { data: users, isLoading: isLoadingUserProfiles } =
    useGetUserProfiles();
  const { data: participants, isLoading: isLoadingParticipants } =
    useGetParticipationsByEventId(event.id);
  const { data: myPaymentRequestsData, isLoading: isLoadingMyPaymentRequests } =
    useGetMyPaymentRequests();
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

  const currentUserId = user?.data.id;
  const isOrganizer = currentUserId === event.organizer;
  const isAdmin = (user?.data.userlevel ?? 0) >= 8;
  const paymentRequests = (paymentRequestsData?.data.data ??
    []) as PaymentRequest[];
  const myEventAssignments = (
    (myPaymentRequestsData?.data.data.assignments ?? []) as Array<
      PaymentRequestRecipient & { eventId: number }
    >
  ).filter(
    (assignment) =>
      assignment.type === "event" && assignment.eventId === event.id,
  );
  const updateAssignmentsPaid = useUpdatePaymentRequestAssignmentsPaid();
  const participantAssignments = myEventAssignments;
  const participantVisibleAmounts = getVisiblePaymentAssignmentAmounts(
    participantAssignments,
  );

  const isLoading =
    isLoadingLocations ||
    isLoadingUserProfiles ||
    isLoadingParticipants ||
    isLoadingMyPaymentRequests ||
    isLoadingPaymentRequests;

  return (
    <Grid.Col span={12}>
      <SectionPanel title={event.title} icon={<IconCalendarEvent size={18} />}>
        {isLoading ? (
          <Loader size="sm" />
        ) : (
          <Accordion
            defaultValue={[event.title, "Osallistujat", "Linkit"]}
            multiple
          >
            <Accordion.Item value={event.title}>
              <Accordion.Control>Tapahtuman tiedot</Accordion.Control>
              <Accordion.Panel>
                {location && <Text c="dimmed">@ {location.name}</Text>}
                <Text>
                  {dayjs(event.startDate).format("L LT")} -{" "}
                  {dayjs(event.endDate).format("L LT")}
                </Text>
                <Text>{event.description}</Text>
                {event.organizer && (
                  <Group gap={6} mt="xs" fz="sm">
                    <Text size="sm" c="dimmed">
                      Tilavastaava:
                    </Text>
                    <User
                      userId={event.organizer}
                      users={users?.data ?? []}
                      avatarSize={20}
                    />
                  </Group>
                )}
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
                      const canSeeAmounts =
                        isOrganizer || isAdmin || p.userId === currentUserId;
                      const { unpaidAmount, awaitingConfirmationAmount } =
                        getVisiblePaymentAssignmentAmounts(assignments);
                      const paymentState =
                        getVisiblePaymentAssignmentState(assignments);
                      const confirmIds = getVisiblePositivePaymentAssignmentIds(
                        assignments,
                        (assignment) => assignment.paid < 2,
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
                            <div>
                              {profile?.nickname || profile?.username}
                              <Text
                                component="span"
                                size="xs"
                                c="dimmed"
                                ml="xs"
                                title={
                                  p.arrivalDate &&
                                  dayjs(p.arrivalDate).isValid()
                                    ? `Saapuminen: ${dayjs(p.arrivalDate).locale("fi").format("D.M.YYYY")}`
                                    : "Saapumispäivä ei tiedossa"
                                }
                              >
                                {p.arrivalDate && dayjs(p.arrivalDate).isValid()
                                  ? dayjs(p.arrivalDate)
                                      .locale("fi")
                                      .format("dddd")
                                  : "Ei tiedossa"}
                              </Text>
                            </div>

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

                            {canSeeAmounts && unpaidAmount > 0 && (
                              <Text size="xs" c="red.7">
                                {formatCents(unpaidAmount)}
                              </Text>
                            )}
                            {canSeeAmounts &&
                              awaitingConfirmationAmount > 0 && (
                                <Text size="xs" c="yellow.8">
                                  {formatCents(awaitingConfirmationAmount)}
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
                {participantAssignments.length > 0 && (
                  <>
                    {getPositiveAssignmentIds(
                      participantAssignments,
                      (assignment) => assignment.paid === 0,
                    ).length > 0 &&
                      participantVisibleAmounts.unpaidAmount > 0 && (
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
                    {(() => {
                      const { unpaidAmount, awaitingConfirmationAmount } =
                        participantVisibleAmounts;

                      if (unpaidAmount > 0) {
                        return (
                          <Text mt="xs" size="sm" c="red.7">
                            Maksamatta {formatCents(unpaidAmount)}
                          </Text>
                        );
                      }

                      if (awaitingConfirmationAmount > 0) {
                        return (
                          <Text mt="xs" size="sm" c="yellow.8">
                            Odottaa vahvistusta{" "}
                            {formatCents(awaitingConfirmationAmount)}
                          </Text>
                        );
                      }

                      return null;
                    })()}
                  </>
                )}
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="Linkit">
              <Accordion.Control>Linkit</Accordion.Control>
              <Accordion.Panel>
                <Group>
                  {(event.votingState === 2 || event.votingState === 3) && (
                    <Anchor
                      component={Link}
                      href={`/dashboard/vote/${event.id}`}
                    >
                      Äänestys
                    </Anchor>
                  )}
                  {event.votingState === 0 && (
                    <Anchor component={Link} href="/dashboard/game-suggestions">
                      Peliehdotukset
                    </Anchor>
                  )}
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
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </SectionPanel>
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
