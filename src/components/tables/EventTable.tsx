import { ActionIcon, Group, Table } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import eventSchema from "../../schemas/eventSchema";
import locationSchema from "../../schemas/locationSchema";
import userSchema from "../../schemas/userSchema";
import "dayjs/locale/fi";
import { getVotingState } from "../../utils/getVotingState";
import User from "../User";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

export default function EventTable({
  data,
  locations,
  users,
  onEdit,
  onDelete,
}: {
  data: z.infer<typeof eventSchema>[];
  locations: z.infer<typeof locationSchema>[];
  users: z.infer<typeof userSchema>[];
  onEdit: (row: z.infer<typeof eventSchema>) => void;
  onDelete: (row: z.infer<typeof eventSchema>) => void;
}) {
  return (
    <Table.ScrollContainer minWidth={1400} type="native">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Nimi</Table.Th>
            <Table.Th>Kuvaus</Table.Th>
            <Table.Th>Paikka</Table.Th>
            <Table.Th>Alkamispäivä</Table.Th>
            <Table.Th>Päättymispäivä</Table.Th>
            <Table.Th>Äänestys</Table.Th>
            <Table.Th>Aktiivinen</Table.Th>
            <Table.Th>Pelejä</Table.Th>
            <Table.Th>LAN-mestari</Table.Th>
            <Table.Th>Paintcompo voittaja</Table.Th>
            <Table.Th>Tilavastaava</Table.Th>
            <Table.Th>Toiminnot</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((eventObject) => {
            const location = locations.find(
              (candidate) => candidate.id === eventObject.location,
            );

            return (
              <Table.Tr key={eventObject.id}>
                <Table.Td>{eventObject.id}</Table.Td>
                <Table.Td>{eventObject.title}</Table.Td>
                <Table.Td>{eventObject.description}</Table.Td>
                <Table.Td>{location?.name || "—"}</Table.Td>
                <Table.Td>
                  {eventObject.startDate
                    ? dayjs(eventObject.startDate).format("L LT")
                    : "—"}
                </Table.Td>
                <Table.Td>
                  {eventObject.endDate
                    ? dayjs(eventObject.endDate).format("L LT")
                    : "—"}
                </Table.Td>
                <Table.Td>{getVotingState(eventObject.votingState)}</Table.Td>
                <Table.Td>{eventObject.active ? "Kyllä" : "Ei"}</Table.Td>
                <Table.Td>{eventObject.winnerGamesCount || "—"}</Table.Td>
                <Table.Td>
                  {eventObject.lanMaster ? (
                    <User userId={eventObject.lanMaster} users={users} />
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td>
                  {eventObject.paintCompoWinner ? (
                    <User userId={eventObject.paintCompoWinner} users={users} />
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td>
                  {eventObject.organizer ? (
                    <User userId={eventObject.organizer} users={users} />
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="filled"
                      aria-label="Muokkaa"
                      onClick={() => onEdit(eventObject)}
                    >
                      <IconEdit />
                    </ActionIcon>
                    <ActionIcon
                      variant="filled"
                      aria-label="Poista"
                      onClick={() => onDelete(eventObject)}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
