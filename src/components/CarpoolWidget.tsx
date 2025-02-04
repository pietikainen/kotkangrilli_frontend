import {
  Button,
  Group,
  Image,
  List,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import useAddPassenger from "../api/useAddPassenger.hook";
import useDeleteCarpool from "../api/useDeleteCarpool.hook";
import useDeletePassenger from "../api/useDeletePassenger.hook";
import useGetPassengersByCarpoolId from "../api/useGetPassengersByCarpoolId.hook";
import useGetUser from "../api/useGetUser.hook";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import CarpoolForm from "../components/forms/CarpoolForm";
import "dayjs/locale/fi";
import { z } from "zod";
import carpoolSchema from "../schemas/carpoolSchema";
import participationSchema from "../schemas/participationSchema";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

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
  const { data: users, isLoading: isLoadingUsers } = useGetUserProfiles();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 50em)");

  const addPassenger = useAddPassenger();
  const deletePassenger = useDeletePassenger();
  const deleteCarpool = useDeleteCarpool();

  if (isLoadingPassengers || isLoadingUsers) return <Loader />;

  const driver = users?.data.find(
    (u: { id: number }) => u.id === carpool.driverId,
  );
  const selfPassenger = passengers?.data.data.find(
    (p: { id: number; passengerId: number }) => p.passengerId === user?.data.id,
  );
  const isDriver = carpool.driverId === user?.data.id;

  return (
    <div>
      <Stack>
        <h3>{carpool.departureCity}</h3>
        <Stack>
          <Group>
            Kuljettaja:
            {driver?.avatar && (
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  driver?.snowflake
                }/${driver?.avatar}.png?size=24`}
                alt={`${driver?.username} avatar`}
                mah={24}
                w="auto"
                fit="contain"
              />
            )}
            {driver?.username}
          </Group>
          <span>Lähtöaika: {dayjs(carpool.departureTime).format("L LT")}</span>
          <span>Kyytipaikkoja: {carpool.seats}</span>
        </Stack>
        <span>Kyytiläisiä: {passengers?.data.data.length}</span>
        <List>
          {passengers?.data.data.map(
            (passenger: { id: number; passengerId: number }) => {
              const passengerUser = users?.data.find(
                (u: { id: number }) => u.id === passenger.passengerId,
              );
              return (
                <List.Item key={passenger.id}>
                  <Group>
                    {passengerUser?.avatar && (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${passengerUser.snowflake}/${passengerUser.avatar}.png?size=16`}
                        alt={`${passengerUser.username} avatar`}
                        mah={16}
                        w="auto"
                        fit="contain"
                      />
                    )}
                    {passengerUser?.username}

                    {isDriver && (
                      <Button
                        size="xs"
                        variant="outline"
                        color="red"
                        onClick={() => deletePassenger.mutate(passenger.id)}
                      >
                        Poista
                      </Button>
                    )}
                  </Group>
                </List.Item>
              );
            },
          )}
        </List>
      </Stack>
      {!isDriver && (
        <Group mt={40}>
          {selfPassenger ? (
            <Button
              onClick={() => deletePassenger.mutate(selfPassenger.id)}
              color="red"
              disabled={!participation}
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
        </Group>
      )}
      {isDriver && (
        <Group mt={20}>
          <Button onClick={open} disabled={!participation}>
            Muokkaa
          </Button>
          <Button onClick={openDelete} disabled={!participation}>
            Poista
          </Button>
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
        <span>
          Ilmoittautuneita kyytiläisiä: {passengers?.data.data.length}
        </span>
        {passengers?.data.data.length && (
          <p>Poista kyytiläiset ennen kimppakyydin poistoa.</p>
        )}
        <Group>
          <Button onClick={closeDelete}>Peruuta</Button>
          <Button
            color="red"
            onClick={() => carpool.id && deleteCarpool.mutate(carpool.id)}
            disabled={passengers?.data.data.length > 0 || !carpool.id}
          >
            Poista
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
