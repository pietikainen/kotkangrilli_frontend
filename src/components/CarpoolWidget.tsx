import {
  ActionIcon,
  Button,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconChevronDown,
  IconCurrencyEuro,
  IconCurrencyEuroOff,
  IconDotsVertical,
  IconPencil,
  IconReceiptRefund,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import useAddPassenger from "../api/useAddPassenger.hook";
import useDeleteCarpool from "../api/useDeleteCarpool.hook";
import useDeletePassenger from "../api/useDeletePassenger.hook";
import useGetPassengersByCarpoolId from "../api/useGetPassengersByCarpoolId.hook";
import useGetPaymentRequestsByEventId from "../api/useGetPaymentRequestsByEventId.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import useUpdatePaymentRequestAssignmentsPaid from "../api/useUpdatePaymentRequestAssignmentsPaid.hook";
import CarpoolForm from "../components/forms/CarpoolForm";
import PaymentRequestModal from "../components/PaymentRequestModal";
import "dayjs/locale/fi";
import { z } from "zod";
import carpoolSchema from "../schemas/carpoolSchema";
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
import classes from "./CarpoolWidget.module.css";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

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

type PassengerRow = {
  id: number;
  passengerId: number;
  paid: number;
  paymentAssignments: PaymentRequestRecipient[];
};

export default function CarpoolWidget({
  carpool,
  participation,
}: {
  carpool: z.infer<typeof carpoolSchema>;
  participation?: z.infer<typeof participationSchema>;
}) {
  const { data: user } = useGetUser();
  const { data: passengers, isLoading: isLoadingPassengers } =
    useGetPassengersByCarpoolId(carpool.id);
  const { data: paymentRequestsData, isLoading: isLoadingPaymentRequests } =
    useGetPaymentRequestsByEventId(carpool.eventId);
  const { data: users, isLoading: isLoadingUsers } = useGetUserProfiles();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [
    paymentModalOpened,
    { open: openPaymentModal, close: closePaymentModal },
  ] = useDisclosure(false);
  const [
    refundModalOpened,
    { open: openRefundModal, close: closeRefundModal },
  ] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [refundUserId, setRefundUserId] = React.useState<number | null>(null);

  const addPassenger = useAddPassenger();
  const deletePassenger = useDeletePassenger();
  const deleteCarpool = useDeleteCarpool();
  const updateAssignmentsPaid = useUpdatePaymentRequestAssignmentsPaid();

  if (isLoadingPassengers || isLoadingUsers || isLoadingPaymentRequests) {
    return <Loader />;
  }

  const driver = users?.data.find(
    (u: { id: number }) => u.id === carpool.driverId,
  );
  const paymentRequests = (paymentRequestsData?.data.data ??
    []) as PaymentRequest[];
  const passengerRows: PassengerRow[] = (passengers?.data.data ?? []).map(
    (row: { id: number; passengerId: number }) => {
      const assignments = getScopedPaymentAssignments({
        paymentRequests,
        type: "ride",
        sourceId: carpool.id,
        userId: row.passengerId,
      });

      return {
        ...row,
        paid: getPaymentState(assignments),
        paymentAssignments: assignments,
      };
    },
  );
  const selfPassenger = passengerRows.find(
    (p: PassengerRow) => p.passengerId === user?.data.id,
  );
  const selfPassengerVisiblePaymentAmounts = selfPassenger
    ? getVisiblePaymentAssignmentAmounts(selfPassenger.paymentAssignments)
    : null;
  const isDriver = carpool.driverId === user?.data.id;
  const isAdmin = (user?.data.userlevel ?? 0) >= 8;
  const hasRidePaymentRequests = paymentRequests.some(
    (paymentRequest) =>
      paymentRequest.type === "ride" && paymentRequest.sourceId === carpool.id,
  );

  return (
    <div>
      <Stack>
        <Title order={3}>{carpool.departureCity}</Title>
        <Stack>
          <Group>
            Kuljettaja:
            {driver?.avatar ? (
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  driver?.snowflake
                }/${driver?.avatar}.png?size=24`}
                fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${driver?.nickname || driver?.username} avatar`}
                mah={24}
                w="auto"
                fit="contain"
              />
            ) : (
              <Image
                src="https://cdn.discordapp.com/embed/avatars/0.png"
                alt={`${driver?.nickname || driver?.username} avatar`}
                mah={24}
                w="auto"
                fit="contain"
              />
            )}
            {driver?.nickname || driver?.username}
          </Group>
          <Text>Lähtöaika: {dayjs(carpool.departureTime).format("L LT")}</Text>
          <Text>Kyytipaikkoja: {carpool.seats}</Text>
        </Stack>
        <Text>Kyytiläisiä: {passengerRows.length}</Text>
        {carpool.description && <Text>{carpool.description}</Text>}
        <ul className={classes.passengers} aria-label="Kyytiläiset">
          {passengerRows.map((passenger: PassengerRow) => {
            const passengerUser = users?.data.find(
              (u: { id: number }) => u.id === passenger.passengerId,
            );
            const visiblePaymentAmounts = getVisiblePaymentAssignmentAmounts(
              passenger.paymentAssignments,
            );
            const visiblePaymentState =
              getVisiblePaymentAssignmentState(passenger.paymentAssignments) ??
              0;
            const confirmIds = getVisiblePositivePaymentAssignmentIds(
              passenger.paymentAssignments,
              (assignment) => assignment.paid < 2,
            );

            return (
              <li key={passenger.id} className={classes.passenger}>
                <Group gap="xs">
                  {passengerUser?.avatar ? (
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${passengerUser.snowflake}/${passengerUser.avatar}.png?size=16`}
                      fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${passengerUser?.nickname || passengerUser?.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  ) : (
                    <Image
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${passengerUser?.nickname || passengerUser?.username} avatar`}
                      mah={16}
                      w="auto"
                      fit="contain"
                    />
                  )}
                  <Text size="sm" fw={500} className={classes.name}>
                    {passengerUser?.nickname || passengerUser?.username}
                  </Text>

                  {visiblePaymentState === 0 &&
                    passenger.paymentAssignments.length > 0 && (
                      <ThemeIcon size="sm" color="red">
                        <IconCurrencyEuroOff />
                      </ThemeIcon>
                    )}
                  {visiblePaymentState === 1 && (
                    <ThemeIcon size="sm" color="yellow">
                      <IconCurrencyEuro />
                    </ThemeIcon>
                  )}
                  {visiblePaymentState === 2 &&
                    passenger.paymentAssignments.length > 0 && (
                      <ThemeIcon size="sm" color="green">
                        <IconCurrencyEuro />
                      </ThemeIcon>
                    )}

                  {(() => {
                    const { unpaidAmount, awaitingConfirmationAmount } =
                      visiblePaymentAmounts;
                    const canSeeAmounts =
                      isDriver ||
                      isAdmin ||
                      passenger.passengerId === user?.data.id;

                    if (canSeeAmounts && unpaidAmount > 0) {
                      return (
                        <Text size="xs" c="red.7" className={classes.amount}>
                          Maksamatta {formatCents(unpaidAmount)}
                        </Text>
                      );
                    }

                    if (canSeeAmounts && awaitingConfirmationAmount > 0) {
                      return (
                        <Text size="xs" c="yellow.8" className={classes.amount}>
                          Odottaa vahvistusta{" "}
                          {formatCents(awaitingConfirmationAmount)}
                        </Text>
                      );
                    }

                    return null;
                  })()}

                  {(isDriver || isAdmin) && (
                    <Menu position="bottom-end" shadow="md" width={240}>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label={`Kyytiläisen toiminnot: ${passengerUser?.nickname || passengerUser?.username}`}
                        >
                          <IconDotsVertical size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>
                          {passengerUser?.nickname || passengerUser?.username}
                        </Menu.Label>
                        <Menu.Item
                          leftSection={<IconTrash size={16} />}
                          color="red"
                          onClick={() => deletePassenger.mutate(passenger.id)}
                          disabled={
                            deletePassenger.isPending ||
                            (hasRidePaymentRequests && !isAdmin)
                          }
                        >
                          Poista kyytiläinen
                        </Menu.Item>
                        {confirmIds.length > 0 && (
                          <Menu.Item
                            leftSection={<IconCurrencyEuro size={16} />}
                            color="green"
                            disabled={updateAssignmentsPaid.isPending}
                            onClick={() =>
                              updateAssignmentsPaid.mutate(
                                {
                                  ids: confirmIds,
                                  paidLevel: 2,
                                },
                                {
                                  onSuccess: () => {
                                    notifications.show({
                                      title: "Maksu hyväksytty",
                                      message: "Kyytiläisen maksu hyväksyttiin",
                                      color: "green",
                                    });
                                  },
                                },
                              )
                            }
                          >
                            Vahvista maksu
                          </Menu.Item>
                        )}
                        <Menu.Item
                          leftSection={<IconReceiptRefund size={16} />}
                          color="grape"
                          onClick={() => {
                            setRefundUserId(passenger.passengerId);
                            openRefundModal();
                          }}
                        >
                          Luo hyvitys
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
              </li>
            );
          })}
        </ul>
      </Stack>
      {!isDriver && (
        <Group mt="lg" gap="xs">
          {selfPassenger ? (
            <Button
              onClick={() => deletePassenger.mutate(selfPassenger.id)}
              color="red"
              disabled={!participation || hasRidePaymentRequests}
            >
              Poista ilmoittautuminen
            </Button>
          ) : (
            <Button
              onClick={() => carpool.id && addPassenger.mutate(carpool.id)}
              disabled={
                !participation ||
                carpool.seats <= passengers?.data.data.length ||
                !carpool.id
              }
            >
              Ilmoittaudu kyytiläiseksi
            </Button>
          )}
          {selfPassenger &&
            (selfPassengerVisiblePaymentAmounts?.unpaidAmount ?? 0) > 0 &&
            getPositiveAssignmentIds(
              selfPassenger.paymentAssignments,
              (assignment) => assignment.paid === 0,
            ).length > 0 && (
              <Button
                onClick={() =>
                  updateAssignmentsPaid.mutate({
                    ids: getPositiveAssignmentIds(
                      selfPassenger.paymentAssignments,
                      (assignment) => assignment.paid === 0,
                    ),
                    paidLevel: 1,
                  })
                }
              >
                Merkitse maksetuksi
              </Button>
            )}
        </Group>
      )}
      {(isDriver || isAdmin) && (
        <Group mt="lg" gap="xs">
          <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
              <Button
                variant="default"
                rightSection={<IconChevronDown size={16} />}
              >
                Hallitse kyytiä
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Kyydin hallinta</Menu.Label>
              <Menu.Item
                onClick={openPaymentModal}
                disabled={!participation}
                leftSection={<IconCurrencyEuro size={16} />}
              >
                Luo maksu
              </Menu.Item>
              <Menu.Item
                onClick={open}
                disabled={!participation}
                leftSection={<IconPencil size={16} />}
              >
                Muokkaa
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                onClick={openDelete}
                disabled={!participation}
                color="red"
                leftSection={<IconTrash size={16} />}
              >
                Poista kyyti
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      )}
      <Modal
        opened={opened}
        onClose={close}
        title="Muokkaa kimppakyytiä"
        fullScreen={isMobile}
      >
        <CarpoolForm carpool={carpool} close={close} />
      </Modal>
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Poista kyyti"
        fullScreen={isMobile}
      >
        <Text>Haluatko varmasti poistaa kimppakyydin?</Text>
        <Title order={3}>{carpool.departureCity}</Title>
        <Text>
          Ilmoittautuneita kyytiläisiä: {passengers?.data.data.length}
        </Text>
        {passengerRows.length && (
          <Text>Poista kyytiläiset ennen kimppakyydin poistoa.</Text>
        )}
        <Group>
          <Button onClick={closeDelete}>Peruuta</Button>
          <Button
            color="red"
            onClick={() => carpool.id && deleteCarpool.mutate(carpool.id)}
            disabled={passengerRows.length > 0 || !carpool.id}
          >
            Poista
          </Button>
        </Group>
      </Modal>
      <PaymentRequestModal
        opened={paymentModalOpened}
        onClose={closePaymentModal}
        title="Luo kyytimaksu"
        description="Pyydetään kaikilta nykyisiltä ja tulevilta kyytiläisiltä."
        type="ride"
        eventId={carpool.eventId}
        sourceId={carpool.id}
      />
      <PaymentRequestModal
        opened={refundModalOpened}
        onClose={closeRefundModal}
        title="Luo hyvitys"
        description="Hyvitys kohdistetaan valitulle kyytiläiselle ja merkitään heti vahvistetuksi."
        type="ride"
        eventId={carpool.eventId}
        sourceId={carpool.id}
        userIds={refundUserId ? [refundUserId] : []}
        forceNegative
        submitLabel="Luo hyvitys"
      />
    </div>
  );
}
