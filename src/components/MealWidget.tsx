import {
  ActionIcon,
  Badge,
  Blockquote,
  Button,
  Group,
  Image,
  List,
  Loader,
  Modal,
  Popover,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCurrencyEuro,
  IconCurrencyEuroOff,
  IconInfoCircle,
  IconMessage,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React, { useState } from "react";
import { z } from "zod";
import useAddEater from "../api/useAddEater.hook";
import useDeleteEater from "../api/useDeleteEater.hook";
import useDeleteMeal from "../api/useDeleteMeal.hook";
import useGetEaters from "../api/useGetEaters.hook";
import useGetPaymentRequestsByEventId from "../api/useGetPaymentRequestsByEventId.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdateEaterComment from "../api/useUpdateEaterComment.hook";
import useUpdatePaymentRequestAssignmentsPaid from "../api/useUpdatePaymentRequestAssignmentsPaid.hook";
import MealForm from "../components/forms/MealForm";
import PaymentRequestModal from "../components/PaymentRequestModal";
import eaterSchema from "../schemas/eaterSchema";
import mealSchema from "../schemas/mealSchema";
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

dayjs.locale("fi");
dayjs.extend(localizedFormat);

const dayLabels = ["Torstai", "Perjantai", "Lauantai", "Sunnuntai"];

function getPaymentState(assignments: PaymentRequestRecipient[]) {
  const activeAssignments = assignments.filter(
    (assignment) => !assignment.cancelledAt,
  );

  if (activeAssignments.length === 0) {
    return 0;
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

type EaterRow = z.infer<typeof eaterSchema> & {
  paid: number;
  paymentAssignments: PaymentRequestRecipient[];
};

type UserProfile = {
  id?: number;
  snowflake?: string | bigint;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
};

export default function MealWidget({
  meal,
  participation,
  participations = [],
}: {
  meal: z.infer<typeof mealSchema>;
  participation?: z.infer<typeof participationSchema>;
  participations?: z.infer<typeof participationSchema>[];
}) {
  const { data: user } = useGetUser();
  const { data: eaters, isLoading: isLoadingEaters } = useGetEaters(meal.id);
  const { data: paymentRequestsData, isLoading: isLoadingPaymentRequests } =
    useGetPaymentRequestsByEventId(meal.eventId);
  const { data: users, isLoading: isLoadingUsers } = useGetUserProfiles();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [commentOpened, { open: openComment, close: closeComment }] =
    useDisclosure(false);
  const [
    eatersModalOpened,
    { open: openEatersModal, close: closeEatersModal },
  ] = useDisclosure(false);
  const [
    addEaterModalOpened,
    { open: openAddEaterModal, close: closeAddEaterModal },
  ] = useDisclosure(false);
  const [
    paymentModalOpened,
    { open: openPaymentModal, close: closePaymentModal },
  ] = useDisclosure(false);
  const [
    refundModalOpened,
    { open: openRefundModal, close: closeRefundModal },
  ] = useDisclosure(false);
  const [comment, setComment] = useState<string>("");
  const [addEaterComment, setAddEaterComment] = useState<string>("");
  const [selectedEaterId, setSelectedEaterId] = useState<string | null>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [refundUserId, setRefundUserId] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 50em)");

  const addEater = useAddEater();
  const deleteEater = useDeleteEater();
  const deleteMeal = useDeleteMeal();
  const updateAssignmentsPaid = useUpdatePaymentRequestAssignmentsPaid();
  const updateEaterComment = useUpdateEaterComment();

  if (isLoadingEaters || isLoadingUsers || isLoadingPaymentRequests) {
    return <Loader />;
  }

  const userProfiles = (users?.data ?? []) as UserProfile[];
  const chef = userProfiles.find((u) => u.id === meal.chefId);
  const isChef = meal.chefId === user?.data.id;
  const isAdmin = (user?.data.userlevel ?? 0) >= 8;
  const paymentRequests = (paymentRequestsData?.data.data ??
    []) as PaymentRequest[];
  const eaterRows: EaterRow[] = (eaters?.data.data ?? []).map(
    (row: z.infer<typeof eaterSchema>) => {
      const assignments = getScopedPaymentAssignments({
        paymentRequests,
        type: "meal",
        sourceId: meal.id,
        userId: row.eaterId,
      });

      return {
        ...row,
        paid: getPaymentState(assignments),
        paymentAssignments: assignments,
      };
    },
  );
  const existingEaterIds = new Set(eaterRows.map((row) => row.eaterId));
  const addableEaterOptions = participations
    .filter((participant) => !existingEaterIds.has(participant.userId))
    .map((participant) => {
      const profile = userProfiles.find(
        (user) => user.id === participant.userId,
      );

      return {
        value: String(participant.userId),
        label:
          profile?.nickname || profile?.username || String(participant.userId),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "fi"));
  const eater = eaterRows.find(
    (row: EaterRow) => row.eaterId === user?.data.id,
  );
  const eaterVisiblePaymentAmounts = eater
    ? getVisiblePaymentAssignmentAmounts(eater.paymentAssignments)
    : null;
  const eaterVisiblePaymentState = eater
    ? getVisiblePaymentAssignmentState(eater.paymentAssignments)
    : null;
  const hasMealPaymentRequests = paymentRequests.some(
    (paymentRequest) =>
      paymentRequest.type === "meal" && paymentRequest.sourceId === meal.id,
  );

  return (
    <div>
      <Stack>
        <Group>
          <Title order={3}>{meal.name}</Title>à la{" "}
          <>
            {chef?.avatar ? (
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  chef?.snowflake
                }/${chef?.avatar}.png?size=32`}
                fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${chef?.nickname || chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            ) : (
              <Image
                src="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${chef?.nickname || chef?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
            )}
            {chef?.nickname || chef?.username}
          </>
        </Group>
        <Group>
          {meal.days.map((d) => (
            <Badge key={d}>{dayLabels[d]}</Badge>
          ))}
        </Group>
        <Text>
          Ilmoittautuminen päättyy: {dayjs(meal.signupEnd).format("L LT")}
        </Text>
        {meal.description && <Text>{meal.description}</Text>}
        <Group>
          <Text>
            Hinta-arvio: {meal.price ? `${meal.price / 100} €` : "Ei tietoa"}
          </Text>
          {meal.mobilepay && <Badge color="indigo">MobilePay</Badge>}
          {meal.banktransfer && <Badge color="teal">Tilisiirto</Badge>}
        </Group>
        <Text>Syöjiä: {eaterRows.length}</Text>
        <List
          type="ordered"
          style={{
            columnCount: 2,
          }}
        >
          {eaterRows.map((e: EaterRow) => {
            const eaterUser = users?.data.find(
              (u: { id: number }) => u.id === e.eaterId,
            );
            const visiblePaymentAmounts = getVisiblePaymentAssignmentAmounts(
              e.paymentAssignments,
            );
            const visiblePaymentState =
              getVisiblePaymentAssignmentState(e.paymentAssignments) ?? 0;
            const confirmIds = getVisiblePositivePaymentAssignmentIds(
              e.paymentAssignments,
              (assignment) => assignment.paid < 2,
            );

            return (
              <List.Item key={e.id}>
                <Group>
                  {eaterUser?.avatar ? (
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${eaterUser.snowflake}/${eaterUser.avatar}.png?size=16`}
                      fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${eaterUser.nickname || eaterUser.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  ) : (
                    <Image
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${eaterUser.nickname || eaterUser.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  )}
                  {eaterUser?.nickname || eaterUser?.username}

                  {visiblePaymentState === 0 && (
                    <ThemeIcon size="sm" color="red">
                      <IconCurrencyEuroOff />
                    </ThemeIcon>
                  )}

                  {visiblePaymentState === 1 && (
                    <ThemeIcon size="sm" color="yellow">
                      <IconCurrencyEuro />
                    </ThemeIcon>
                  )}

                  {visiblePaymentState === 2 && (
                    <ThemeIcon size="sm" color="green">
                      <IconCurrencyEuro />
                    </ThemeIcon>
                  )}

                  {(() => {
                    const { unpaidAmount, awaitingConfirmationAmount } =
                      visiblePaymentAmounts;
                    const canSeeAmounts =
                      isChef || isAdmin || e.eaterId === user?.data.id;

                    if (canSeeAmounts && unpaidAmount > 0) {
                      return (
                        <Text size="xs" c="red.7">
                          Maksamatta {formatCents(unpaidAmount)}
                        </Text>
                      );
                    }

                    if (canSeeAmounts && awaitingConfirmationAmount > 0) {
                      return (
                        <Text size="xs" c="yellow.8">
                          Odottaa vahvistusta{" "}
                          {formatCents(awaitingConfirmationAmount)}
                        </Text>
                      );
                    }

                    return null;
                  })()}

                  {e.comment && (
                    <Popover
                      width={200}
                      position="bottom"
                      withArrow
                      shadow="md"
                    >
                      <Popover.Target>
                        <ActionIcon size="sm">
                          <IconMessage />
                        </ActionIcon>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Text size="xs">{e.comment}</Text>
                      </Popover.Dropdown>
                    </Popover>
                  )}

                  {(isChef || isAdmin) && (
                    <>
                      {e.paid === 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() =>
                            e.id &&
                            deleteEater.mutate({
                              id: e.id,
                            })
                          }
                          disabled={
                            !e.id || (hasMealPaymentRequests && !isAdmin)
                          }
                        >
                          Poista syöjä
                        </Button>
                      )}
                      {confirmIds.length > 0 && (
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
                                    message: "Syöjä merkattu maksetuksi",
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
                      {e.paid > 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() =>
                            updateAssignmentsPaid.mutate(
                              {
                                ids: getPositiveAssignmentIds(
                                  e.paymentAssignments,
                                  (assignment) => assignment.paid > 0,
                                ),
                                paidLevel: 0,
                              },
                              {
                                onSuccess: () => {
                                  notifications.show({
                                    title: "Maksu poistettu",
                                    message: "Syöjä merkattu maksamattomaksi",
                                    color: "green",
                                  });
                                },
                              },
                            )
                          }
                          disabled={
                            getPositiveAssignmentIds(
                              e.paymentAssignments,
                              (assignment) => assignment.paid > 0,
                            ).length === 0
                          }
                        >
                          Poista maksu
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="outline"
                        color="grape"
                        onClick={() => {
                          setRefundUserId(e.eaterId);
                          openRefundModal();
                        }}
                      >
                        Luo hyvitys
                      </Button>
                    </>
                  )}
                </Group>
              </List.Item>
            );
          })}
        </List>
      </Stack>
      <Group mt={40}>
        {eater ? (
          <>
            {eaterVisiblePaymentState === 0 && (
              <>
                <Button
                  onClick={() =>
                    eater.id && deleteEater.mutate({ id: eater.id })
                  }
                  color="red"
                  disabled={
                    !participation ||
                    !eater.id ||
                    (!isAdmin && dayjs(meal.signupEnd) <= dayjs()) ||
                    (hasMealPaymentRequests && !isAdmin)
                  }
                >
                  Poista ilmoittautuminen
                </Button>
                <Button
                  onClick={() =>
                    updateAssignmentsPaid.mutate({
                      ids: getPositiveAssignmentIds(
                        eater.paymentAssignments,
                        (assignment) => assignment.paid === 0,
                      ),
                      paidLevel: 1,
                    })
                  }
                  disabled={
                    !eaterVisiblePaymentAmounts?.unpaidAmount ||
                    getPositiveAssignmentIds(
                      eater.paymentAssignments,
                      (assignment) => assignment.paid === 0,
                    ).length === 0
                  }
                >
                  Merkitse maksetuksi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingComment(true);
                    setComment(eater.comment ?? "");
                    openComment();
                  }}
                  disabled={dayjs(meal.signupEnd) <= dayjs()}
                >
                  Muokkaa kommenttia
                </Button>
              </>
            )}
            {eaterVisiblePaymentState === 1 && (
              <Button
                onClick={() =>
                  updateAssignmentsPaid.mutate({
                    ids: getPositiveAssignmentIds(
                      eater.paymentAssignments,
                      (assignment) => assignment.paid === 1,
                    ),
                    paidLevel: 0,
                  })
                }
                color="orange"
                disabled={
                  !eaterVisiblePaymentAmounts?.awaitingConfirmationAmount ||
                  getPositiveAssignmentIds(
                    eater.paymentAssignments,
                    (assignment) => assignment.paid === 1,
                  ).length === 0
                }
              >
                Merkitse maksamattomaksi
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={() => {
              setIsEditingComment(false);
              setComment("");
              openComment();
            }}
            disabled={
              !participation ||
              !meal.id ||
              (!isChef && dayjs(meal.signupEnd) <= dayjs())
            }
          >
            Ilmoittaudu syöjäksi
          </Button>
        )}
        {(isChef || isAdmin) && (
          <>
            <Button onClick={openPaymentModal} disabled={!participation}>
              Luo maksu
            </Button>
            <Button
              onClick={openEatersModal}
              disabled={!participation}
              variant="light"
            >
              Syöjälista
            </Button>
            <Button
              onClick={() => {
                setSelectedEaterId(null);
                setAddEaterComment("");
                openAddEaterModal();
              }}
              disabled={!meal.id || addableEaterOptions.length === 0}
              variant="light"
            >
              Lisää syöjä
            </Button>
            <Button onClick={open} disabled={!participation}>
              Muokkaa
            </Button>
            <Button onClick={openDelete} disabled={!participation}>
              Poista
            </Button>
          </>
        )}
      </Group>
      <Modal
        opened={opened}
        onClose={close}
        title="Muokkaa ateriaa"
        fullScreen={isMobile}
      >
        <MealForm meal={meal} close={close} />
      </Modal>
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Poista ateria"
        fullScreen={isMobile}
      >
        <Text>Haluatko varmasti poistaa aterian?</Text>
        <Title order={3}>{meal.name}</Title>
        <Text>Syöjiä: {eaterRows.length}</Text>
        {eaterRows.length && (
          <Text>
            Poistaminen ei ainakaan vielä toimi jos syöjiä on jo ilmoittautunut.
            Ota yhteyttä ylläpitoon kiitos!
          </Text>
        )}
        <Group>
          <Button onClick={closeDelete}>Peruuta</Button>
          <Button
            color="red"
            onClick={() => meal.id && deleteMeal.mutate(meal.id)}
            disabled={eaterRows.length > 0 || !meal.id}
          >
            Poista
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={eatersModalOpened}
        onClose={closeEatersModal}
        title="Syöjälista"
        fullScreen={isMobile}
      >
        <Table
          striped
          withTableBorder
          highlightOnHover
          verticalSpacing="xs"
          horizontalSpacing="md"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Syöjä</Table.Th>
              <Table.Th>Maksu</Table.Th>
              <Table.Th>Kommentti</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {eaterRows.map((e: EaterRow) => {
              const eaterUser = users?.data.find(
                (u: { id: number }) => u.id === e.eaterId,
              );
              const visiblePaymentState =
                getVisiblePaymentAssignmentState(e.paymentAssignments) ?? 0;

              return (
                <Table.Tr key={e.id}>
                  <Table.Td>
                    <Group gap="xs">
                      {eaterUser?.avatar ? (
                        <Image
                          src={`https://cdn.discordapp.com/avatars/${eaterUser.snowflake}/${eaterUser.avatar}.png?size=24`}
                          fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                          alt={`${eaterUser.nickname || eaterUser.username} avatar`}
                          mah={24}
                          w="auto"
                          fit="contain"
                        />
                      ) : (
                        <Image
                          src="https://cdn.discordapp.com/embed/avatars/0.png"
                          alt={`${eaterUser?.nickname || eaterUser?.username} avatar`}
                          mah={24}
                          w="auto"
                          fit="contain"
                        />
                      )}
                      <Text size="sm">
                        {eaterUser?.nickname || eaterUser?.username}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {visiblePaymentState === 0 && (
                        <>
                          <ThemeIcon size="sm" color="red" variant="light">
                            <IconCurrencyEuroOff />
                          </ThemeIcon>
                          <Text size="sm" c="red.7">
                            Maksamaton
                          </Text>
                        </>
                      )}
                      {visiblePaymentState === 1 && (
                        <>
                          <ThemeIcon size="sm" color="yellow" variant="light">
                            <IconCurrencyEuro />
                          </ThemeIcon>
                          <Text size="sm" c="yellow.8">
                            Maksettu
                          </Text>
                        </>
                      )}
                      {visiblePaymentState === 2 && (
                        <>
                          <ThemeIcon size="sm" color="green" variant="light">
                            <IconCurrencyEuro />
                          </ThemeIcon>
                          <Text size="sm" c="green.8">
                            Hyväksytty
                          </Text>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {e.comment ? (
                      <Text size="sm">{e.comment}</Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        –
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Modal>
      <Modal
        opened={addEaterModalOpened}
        onClose={closeAddEaterModal}
        title="Lisää syöjä"
        fullScreen={isMobile}
      >
        <Stack>
          <Select
            label="Syöjä"
            placeholder="Valitse käyttäjä"
            data={addableEaterOptions}
            value={selectedEaterId}
            onChange={setSelectedEaterId}
            searchable
            nothingFoundMessage="Ei lisättäviä käyttäjiä"
            withAsterisk
          />
          <Textarea
            label={`Kommentti${meal.requiresComment ? " *" : ""}`}
            description={
              meal.requiresComment
                ? "Kommentti vaaditaan tälle aterialle."
                : "Valinnainen"
            }
            value={addEaterComment}
            onChange={(e) => setAddEaterComment(e.currentTarget.value)}
          />
          <Group>
            <Button onClick={closeAddEaterModal} variant="default">
              Peruuta
            </Button>
            <Button
              onClick={() => {
                if (!meal.id || !selectedEaterId) return;

                if (meal.requiresComment && !addEaterComment.trim()) {
                  notifications.show({
                    title: "Kommentti puuttuu",
                    message: "Kommentti on pakollinen tälle aterialle",
                    color: "red",
                  });
                  return;
                }

                addEater.mutate(
                  {
                    mealId: meal.id,
                    eaterId: Number(selectedEaterId),
                    comment: addEaterComment.trim() || null,
                  },
                  {
                    onSuccess: () => {
                      notifications.show({
                        title: "Syöjä lisätty",
                        message: "Syöjä lisättiin aterialle",
                        color: "green",
                      });
                      closeAddEaterModal();
                    },
                  },
                );
              }}
              disabled={
                !selectedEaterId ||
                addEater.isPending ||
                (meal.requiresComment && !addEaterComment.trim())
              }
              loading={addEater.isPending}
            >
              Lisää
            </Button>
          </Group>
        </Stack>
      </Modal>
      <PaymentRequestModal
        opened={paymentModalOpened}
        onClose={closePaymentModal}
        title="Luo ateriamaksu"
        description="Pyydetään kaikilta nykyisiltä ja tulevilta syöjiltä."
        type="meal"
        eventId={meal.eventId}
        sourceId={meal.id}
        defaultAmountCents={meal.price}
      />
      <PaymentRequestModal
        opened={refundModalOpened}
        onClose={closeRefundModal}
        title="Luo hyvitys"
        description="Hyvitys kohdistetaan valitulle syöjälle ja merkitään heti vahvistetuksi."
        type="meal"
        eventId={meal.eventId}
        sourceId={meal.id}
        userIds={refundUserId ? [refundUserId] : []}
        forceNegative
        submitLabel="Luo hyvitys"
      />
      <Modal
        opened={commentOpened}
        onClose={closeComment}
        title={isEditingComment ? "Muokkaa kommenttia" : "Ilmoittaudu syöjäksi"}
        fullScreen={isMobile}
      >
        <Stack>
          {meal.description && (
            <Blockquote color="blue" icon={<IconInfoCircle />} mt="xs">
              {meal.description}
            </Blockquote>
          )}
          <Textarea
            label={`Kommentti (JULKINEN!)${meal.requiresComment ? " *" : ""}`}
            description={
              meal.requiresComment
                ? "Kommentti vaaditaan ilmoittautuessa, katso ohjeet yllä."
                : "Voit kertoa esim. toiveista tai liittää mukavan viestin (valinnainen)"
            }
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          <Group>
            <Button onClick={closeComment} variant="default">
              Peruuta
            </Button>
            <Button
              onClick={async () => {
                if (meal.requiresComment && !comment.trim()) {
                  notifications.show({
                    title: "Kommentti puuttuu",
                    message: "Kommentti on pakollinen tälle aterialle",
                    color: "red",
                  });
                  return;
                }

                if (isEditingComment) {
                  if (!eater?.id) return;
                  updateEaterComment.mutate(
                    { id: eater.id, comment: comment.trim() || null },
                    {
                      onSuccess: () => {
                        notifications.show({
                          title: "Kommentti päivitetty",
                          message: "Kommenttisi on tallennettu",
                          color: "green",
                        });
                        closeComment();
                      },
                    },
                  );
                } else {
                  if (!meal.id) return;
                  addEater.mutate(
                    { mealId: meal.id, comment: comment.trim() || null },
                    {
                      onSuccess: () => {
                        notifications.show({
                          title: "Ilmoittautuminen onnistui",
                          message: "Olet ilmoittautunut syöjäksi",
                          color: "green",
                        });
                        closeComment();
                      },
                    },
                  );
                }
              }}
              disabled={
                !participation || (!isChef && dayjs(meal.signupEnd) <= dayjs())
              }
            >
              {isEditingComment ? "Tallenna" : "Ilmoittaudu"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
