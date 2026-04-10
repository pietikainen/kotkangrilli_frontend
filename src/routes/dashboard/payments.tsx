import {
  Accordion,
  Badge,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import useGetEvents from "../../api/useGetEvents.hook";
import useGetMyPaymentRequests from "../../api/useGetMyPaymentRequests.hook";
import useGetOwnedPaymentRequests from "../../api/useGetOwnedPaymentRequests.hook";
import useUpdatePaymentRequestAssignmentsPaid from "../../api/useUpdatePaymentRequestAssignmentsPaid.hook";
import {
  formatCents,
  getDisplayBalances,
  summarizePaymentAssignments,
} from "../../utils/paymentRequests";

type AssignmentRow = {
  id: number;
  userId: number;
  eventId: number;
  type: "event" | "meal" | "ride";
  sourceId?: number | null;
  amount: number;
  comment?: string | null;
  paid: number;
  cancelledAt?: string | null;
  mealName?: string | null;
  carpoolDepartureCity?: string | null;
  username?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  snowflake?: string | null;
  eventOwnerUsername?: string | null;
  eventOwnerNickname?: string | null;
  eventOwnerAvatar?: string | null;
  eventOwnerSnowflake?: string | null;
  mealOwnerUsername?: string | null;
  mealOwnerNickname?: string | null;
  mealOwnerAvatar?: string | null;
  mealOwnerSnowflake?: string | null;
  carpoolOwnerUsername?: string | null;
  carpoolOwnerNickname?: string | null;
  carpoolOwnerAvatar?: string | null;
  carpoolOwnerSnowflake?: string | null;
};

type EventRow = {
  id: number;
  title?: string;
};

export const Route = createFileRoute("/dashboard/payments")({
  component: RouteComponent,
});

function statusLabel(assignment: AssignmentRow) {
  if (assignment.cancelledAt) {
    return { label: "Peruttu", color: "gray" };
  }

  if (assignment.paid === 0) {
    return { label: "Maksamatta", color: "red" };
  }

  if (assignment.paid === 1) {
    return { label: "Odottaa vahvistusta", color: "yellow" };
  }

  return { label: "Vahvistettu", color: "green" };
}

function typeLabel(type: AssignmentRow["type"]) {
  if (type === "event") return "Tapahtuma";
  if (type === "meal") return "Ateria";
  return "Kyyti";
}

function assignmentLabel(assignment: AssignmentRow, eventTitle?: string) {
  if (assignment.type === "event") {
    return eventTitle ?? "Tapahtuma";
  }

  if (assignment.type === "meal") {
    return assignment.mealName || "Ateria";
  }

  return assignment.carpoolDepartureCity
    ? `Kyyti ${assignment.carpoolDepartureCity}`
    : "Kyyti";
}

function recipientLabel(assignment: AssignmentRow) {
  return assignment.nickname || assignment.username || "Tuntematon käyttäjä";
}

function ownerLabel(assignment: AssignmentRow) {
  if (assignment.type === "event") {
    return (
      assignment.eventOwnerNickname ||
      assignment.eventOwnerUsername ||
      "Tuntematon järjestäjä"
    );
  }

  if (assignment.type === "meal") {
    return (
      assignment.mealOwnerNickname ||
      assignment.mealOwnerUsername ||
      "Tuntematon kokki"
    );
  }

  return (
    assignment.carpoolOwnerNickname ||
    assignment.carpoolOwnerUsername ||
    "Tuntematon kuljettaja"
  );
}

function ownerAvatarUrl(assignment: AssignmentRow) {
  if (assignment.type === "event") {
    if (assignment.eventOwnerAvatar && assignment.eventOwnerSnowflake) {
      return `https://cdn.discordapp.com/avatars/${assignment.eventOwnerSnowflake}/${assignment.eventOwnerAvatar}.png?size=24`;
    }

    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  if (assignment.type === "meal") {
    if (assignment.mealOwnerAvatar && assignment.mealOwnerSnowflake) {
      return `https://cdn.discordapp.com/avatars/${assignment.mealOwnerSnowflake}/${assignment.mealOwnerAvatar}.png?size=24`;
    }

    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  if (assignment.carpoolOwnerAvatar && assignment.carpoolOwnerSnowflake) {
    return `https://cdn.discordapp.com/avatars/${assignment.carpoolOwnerSnowflake}/${assignment.carpoolOwnerAvatar}.png?size=24`;
  }

  return "https://cdn.discordapp.com/embed/avatars/0.png";
}

function groupAssignmentsByEvent(assignments: AssignmentRow[]) {
  return assignments.reduce(
    (acc: Record<number, AssignmentRow[]>, assignment) => {
      if (!acc[assignment.eventId]) {
        acc[assignment.eventId] = [];
      }

      acc[assignment.eventId].push(assignment);
      return acc;
    },
    {},
  );
}

function assignmentGroupKey(assignment: AssignmentRow) {
  return `${assignment.type}:${assignment.sourceId ?? "event"}`;
}

function groupAssignmentsBySource(assignments: AssignmentRow[]) {
  return assignments.reduce(
    (acc: Record<string, AssignmentRow[]>, assignment) => {
      const key = assignmentGroupKey(assignment);

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(assignment);
      return acc;
    },
    {},
  );
}

function groupAssignmentsByRecipient(assignments: AssignmentRow[]) {
  return assignments.reduce(
    (acc: Record<number, AssignmentRow[]>, assignment) => {
      if (!acc[assignment.userId]) {
        acc[assignment.userId] = [];
      }

      acc[assignment.userId].push(assignment);
      return acc;
    },
    {},
  );
}

function getPositiveAssignmentIds(
  assignments: AssignmentRow[],
  predicate: (assignment: AssignmentRow) => boolean,
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

function recipientAvatarUrl(assignment: AssignmentRow) {
  if (assignment.avatar && assignment.snowflake) {
    return `https://cdn.discordapp.com/avatars/${assignment.snowflake}/${assignment.avatar}.png?size=24`;
  }

  return "https://cdn.discordapp.com/embed/avatars/0.png";
}

function recipientNetTotal(assignments: AssignmentRow[]) {
  return assignments
    .filter((assignment) => !assignment.cancelledAt)
    .reduce((sum, assignment) => sum + (assignment.amount ?? 0), 0);
}

function eventTitle(events: EventRow[] | undefined, eventId: number) {
  return (
    events?.find((row) => row.id === eventId)?.title ?? `Tapahtuma ${eventId}`
  );
}

function MySourceSummary({ assignments }: { assignments: AssignmentRow[] }) {
  const summary = summarizePaymentAssignments(assignments as never);
  const displayBalances = getDisplayBalances(summary);
  const hasUnpaidAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 0,
  );
  const hasAwaitingAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 1,
  );

  return (
    <Group>
      {hasUnpaidAssignments && (
        <Text size="sm" fw={700} c="red.7">
          Maksamatta
          {displayBalances.unpaidAmount > 0 &&
            ` ${formatCents(displayBalances.unpaidAmount)}`}
        </Text>
      )}
      {hasAwaitingAssignments && (
        <Text size="sm" fw={700} c="yellow.8">
          Odottaa vahvistusta
          {displayBalances.awaitingConfirmationAmount > 0 &&
            ` ${formatCents(displayBalances.awaitingConfirmationAmount)}`}
        </Text>
      )}
      {!hasUnpaidAssignments && !hasAwaitingAssignments && (
        <Text size="sm" fw={700} c="green.8">
          Ei maksettavaa
        </Text>
      )}
    </Group>
  );
}

function MyEventSummary({ assignments }: { assignments: AssignmentRow[] }) {
  const hasUnpaidAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 0,
  );
  const hasAwaitingAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 1,
  );

  return (
    <Group gap="xs">
      {hasUnpaidAssignments && (
        <Badge color="red" variant="light">
          Maksamatta
        </Badge>
      )}
      {hasAwaitingAssignments && (
        <Badge color="yellow" variant="light">
          Odottaa vahvistusta
        </Badge>
      )}
      {!hasUnpaidAssignments && !hasAwaitingAssignments && (
        <Badge color="green" variant="light">
          Ei maksettavaa
        </Badge>
      )}
    </Group>
  );
}

function OwnedSourceSummary({ assignments }: { assignments: AssignmentRow[] }) {
  const hasUnpaidAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 0,
  );
  const hasAwaitingAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 1,
  );
  const hasConfirmedAssignments = assignments.some(
    (assignment) => !assignment.cancelledAt && assignment.paid === 2,
  );

  return (
    <Group>
      {hasUnpaidAssignments && (
        <Text size="sm" fw={700} c="red.7">
          Maksamatta
        </Text>
      )}
      {hasAwaitingAssignments && (
        <Text size="sm" fw={700} c="yellow.8">
          Odottaa vahvistusta
        </Text>
      )}
      {hasConfirmedAssignments && (
        <Text size="sm" fw={700} c="green.8">
          Vahvistettu
        </Text>
      )}
      {!hasUnpaidAssignments &&
        !hasAwaitingAssignments &&
        !hasConfirmedAssignments && (
          <Text size="sm" fw={700} c="gray.7">
            Ei aktiivisia maksuja
          </Text>
        )}
    </Group>
  );
}

function OwnedEventSummary({ assignments }: { assignments: AssignmentRow[] }) {
  const unpaidCount = assignments.filter(
    (assignment) => !assignment.cancelledAt && assignment.paid === 0,
  ).length;
  const awaitingCount = assignments.filter(
    (assignment) => !assignment.cancelledAt && assignment.paid === 1,
  ).length;
  const confirmedCount = assignments.filter(
    (assignment) => !assignment.cancelledAt && assignment.paid === 2,
  ).length;

  return (
    <Group gap="xs">
      {unpaidCount > 0 && (
        <Badge color="red" variant="light">
          Maksamatta {unpaidCount}
        </Badge>
      )}
      {awaitingCount > 0 && (
        <Badge color="yellow" variant="light">
          Odottaa vahvistusta {awaitingCount}
        </Badge>
      )}
      {confirmedCount > 0 && (
        <Badge color="green" variant="light">
          Vahvistettu {confirmedCount}
        </Badge>
      )}
      {unpaidCount === 0 && awaitingCount === 0 && confirmedCount === 0 && (
        <Badge color="gray" variant="light">
          Ei aktiivisia maksuja
        </Badge>
      )}
    </Group>
  );
}

function MyPaymentsPanel({
  assignments,
  events,
  onMarkPaid,
  isUpdating,
}: {
  assignments: AssignmentRow[];
  events: EventRow[] | undefined;
  onMarkPaid: (ids: number[]) => void;
  isUpdating: boolean;
}) {
  const groupedAssignments = groupAssignmentsByEvent(assignments);

  if (Object.keys(groupedAssignments).length === 0) {
    return <Text>Ei maksuja.</Text>;
  }

  return (
    <Accordion
      multiple
      defaultValue={Object.keys(groupedAssignments).map(
        (eventId) => `event-${eventId}`,
      )}
    >
      {Object.entries(groupedAssignments).map(([eventId, eventAssignments]) => {
        const numericEventId = Number(eventId);
        const title = eventTitle(events, numericEventId);

        return (
          <Accordion.Item key={eventId} value={`event-${eventId}`}>
            <Accordion.Control>
              <Group justify="space-between" wrap="wrap" mr="md">
                <Title order={3}>{title}</Title>
                <MyEventSummary assignments={eventAssignments} />
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion multiple>
                {Object.entries(groupAssignmentsBySource(eventAssignments)).map(
                  ([groupKey, sourceAssignments]) => (
                    <Accordion.Item key={groupKey} value={`source-${groupKey}`}>
                      <Accordion.Control>
                        <Group justify="space-between" wrap="wrap" mr="md">
                          <Group>
                            <Badge>
                              {typeLabel(sourceAssignments[0].type)}
                            </Badge>
                            <Text fw={600}>
                              {assignmentLabel(sourceAssignments[0], title)}
                            </Text>
                            <Image
                              src={ownerAvatarUrl(sourceAssignments[0])}
                              fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                              alt={`${ownerLabel(sourceAssignments[0])} avatar`}
                              mah={24}
                              w="auto"
                              fit="contain"
                            />
                            <Text size="sm">
                              {ownerLabel(sourceAssignments[0])}
                            </Text>
                          </Group>
                          <MySourceSummary assignments={sourceAssignments} />
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Paper withBorder p="sm">
                          <Stack gap="xs">
                            {getPositiveAssignmentIds(
                              sourceAssignments,
                              (assignment) => assignment.paid === 0,
                            ).length > 0 && (
                              <Group justify="flex-end">
                                <Button
                                  size="xs"
                                  onClick={() =>
                                    onMarkPaid(
                                      getPositiveAssignmentIds(
                                        sourceAssignments,
                                        (assignment) => assignment.paid === 0,
                                      ),
                                    )
                                  }
                                  loading={isUpdating}
                                >
                                  Merkitse maksetuksi
                                </Button>
                              </Group>
                            )}
                            {sourceAssignments.map((assignment) => {
                              const status = statusLabel(assignment);

                              return (
                                <Group
                                  key={assignment.id}
                                  justify="space-between"
                                >
                                  <Stack gap={0}>
                                    <Text size="sm" c="dimmed">
                                      {assignment.comment || "Ei selitettä"}
                                    </Text>
                                  </Stack>
                                  <Group>
                                    <Text fw={700}>
                                      {formatCents(assignment.amount)}
                                    </Text>
                                    <Badge color={status.color}>
                                      {status.label}
                                    </Badge>
                                  </Group>
                                </Group>
                              );
                            })}
                          </Stack>
                        </Paper>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ),
                )}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

function OwnedPaymentsPanel({
  assignments,
  events,
  onConfirmPaid,
  isUpdating,
}: {
  assignments: AssignmentRow[];
  events: EventRow[] | undefined;
  onConfirmPaid: (ids: number[]) => void;
  isUpdating: boolean;
}) {
  const groupedAssignments = groupAssignmentsByEvent(assignments);

  if (Object.keys(groupedAssignments).length === 0) {
    return (
      <Text>
        Ei omiin tapahtumiin, aterioihin tai kyyteihin liittyviä maksuja.
      </Text>
    );
  }

  return (
    <Accordion
      multiple
      defaultValue={Object.keys(groupedAssignments).map(
        (eventId) => `owned-event-${eventId}`,
      )}
    >
      {Object.entries(groupedAssignments).map(([eventId, eventAssignments]) => {
        const numericEventId = Number(eventId);
        const title = eventTitle(events, numericEventId);

        return (
          <Accordion.Item key={eventId} value={`owned-event-${eventId}`}>
            <Accordion.Control>
              <Group justify="space-between" wrap="wrap" mr="md">
                <Title order={3}>{title}</Title>
                <OwnedEventSummary assignments={eventAssignments} />
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion multiple>
                {Object.entries(groupAssignmentsBySource(eventAssignments)).map(
                  ([groupKey, sourceAssignments]) => (
                    <Accordion.Item
                      key={groupKey}
                      value={`owned-source-${groupKey}`}
                    >
                      <Accordion.Control>
                        <Group justify="space-between" wrap="wrap" mr="md">
                          <Group>
                            <Badge>
                              {typeLabel(sourceAssignments[0].type)}
                            </Badge>
                            <Text fw={600}>
                              {assignmentLabel(sourceAssignments[0], title)}
                            </Text>
                          </Group>
                          <OwnedSourceSummary assignments={sourceAssignments} />
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Paper withBorder p="sm">
                          <Stack gap="xs">
                            {Object.entries(
                              groupAssignmentsByRecipient(sourceAssignments),
                            ).map(([recipientId, recipientAssignments]) => {
                              const confirmIds = getPositiveAssignmentIds(
                                recipientAssignments,
                                (assignment) => assignment.paid < 2,
                              );

                              return (
                                <Paper key={recipientId} withBorder p="sm">
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Group>
                                        <Image
                                          src={recipientAvatarUrl(
                                            recipientAssignments[0],
                                          )}
                                          fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                                          alt={`${recipientLabel(
                                            recipientAssignments[0],
                                          )} avatar`}
                                          mah={24}
                                          w="auto"
                                          fit="contain"
                                        />
                                        <Text fw={600}>
                                          {recipientLabel(
                                            recipientAssignments[0],
                                          )}
                                        </Text>
                                      </Group>
                                      <Group>
                                        <Text fw={600}>
                                          Yhteensa{" "}
                                          {formatCents(
                                            recipientNetTotal(
                                              recipientAssignments,
                                            ),
                                          )}
                                        </Text>
                                        {confirmIds.length > 0 && (
                                          <Button
                                            size="xs"
                                            color="green"
                                            onClick={() =>
                                              onConfirmPaid(confirmIds)
                                            }
                                            loading={isUpdating}
                                          >
                                            Vahvista kaikki
                                          </Button>
                                        )}
                                      </Group>
                                    </Group>
                                    {recipientAssignments.map((assignment) => {
                                      const status = statusLabel(assignment);
                                      const canConfirmRow =
                                        recipientAssignments.length > 1 &&
                                        !assignment.cancelledAt &&
                                        (assignment.amount ?? 0) >= 0 &&
                                        assignment.paid < 2;

                                      return (
                                        <Group
                                          key={assignment.id}
                                          justify="space-between"
                                        >
                                          <Text size="sm" c="dimmed">
                                            {assignment.comment ||
                                              "Ei selitettä"}
                                          </Text>
                                          <Group>
                                            <Text fw={700}>
                                              {formatCents(assignment.amount)}
                                            </Text>
                                            <Badge color={status.color}>
                                              {status.label}
                                            </Badge>
                                            {canConfirmRow && (
                                              <Button
                                                size="xs"
                                                color="green"
                                                onClick={() =>
                                                  onConfirmPaid([assignment.id])
                                                }
                                                loading={isUpdating}
                                              >
                                                Vahvista
                                              </Button>
                                            )}
                                          </Group>
                                        </Group>
                                      );
                                    })}
                                  </Stack>
                                </Paper>
                              );
                            })}
                          </Stack>
                        </Paper>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ),
                )}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

function RouteComponent() {
  const { data: paymentData, isLoading: isLoadingPayments } =
    useGetMyPaymentRequests();
  const { data: ownedPaymentData, isLoading: isLoadingOwnedPayments } =
    useGetOwnedPaymentRequests();
  const { data: events, isLoading: isLoadingEvents } = useGetEvents();
  const updateAssignmentsPaid = useUpdatePaymentRequestAssignmentsPaid();

  if (isLoadingPayments || isLoadingOwnedPayments || isLoadingEvents) {
    return <Loader />;
  }

  const eventsData = (events?.data.data ?? []) as EventRow[];
  const myAssignments = (paymentData?.data.data.assignments ??
    []) as AssignmentRow[];
  const ownedAssignments = (ownedPaymentData?.data.data.assignments ??
    []) as AssignmentRow[];

  return (
    <Stack>
      <Title order={2}>Maksut</Title>
      <Tabs defaultValue="mine">
        <Tabs.List>
          <Tabs.Tab value="mine">Omat maksut</Tabs.Tab>
          <Tabs.Tab value="owned">Omien kohteiden maksut</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="mine" pt="md">
          <MyPaymentsPanel
            assignments={myAssignments}
            events={eventsData}
            onMarkPaid={(ids) =>
              updateAssignmentsPaid.mutate({
                ids,
                paidLevel: 1,
              })
            }
            isUpdating={updateAssignmentsPaid.isPending}
          />
        </Tabs.Panel>

        <Tabs.Panel value="owned" pt="md">
          <OwnedPaymentsPanel
            assignments={ownedAssignments}
            events={eventsData}
            onConfirmPaid={(ids) =>
              updateAssignmentsPaid.mutate({
                ids,
                paidLevel: 2,
              })
            }
            isUpdating={updateAssignmentsPaid.isPending}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
