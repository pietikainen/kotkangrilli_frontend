import { Loader, Table, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React from "react";
import { z } from "zod";
import eventSchema from "../schemas/eventSchema";
import locationSchema from "../schemas/locationSchema";
import "dayjs/locale/fi";
import useGetUserProfiles from "../api/useGetUserProfiles.hook";
import User from "./User";

dayjs.locale("fi");
dayjs.extend(localizedFormat);

export default function PastEventRow({
  lanEvent,
  locations,
}: {
  lanEvent: z.infer<typeof eventSchema>;
  locations: z.infer<typeof locationSchema>[];
}) {
  const { data, isPending } = useGetUserProfiles();

  if (isPending) {
    return (
      <Table.Tr>
        <Table.Td>
          <Loader />
        </Table.Td>
      </Table.Tr>
    );
  }

  return (
    <Table.Tr key={lanEvent.id}>
      <Table.Td>
        <Title order={4}>{lanEvent.title}</Title>
        <Text>@ {locations.find((l) => l.id === lanEvent.location)?.name}</Text>
        <Text>{lanEvent.description}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{dayjs(lanEvent.startDate).format("L")}</Text>
        <Text>{dayjs(lanEvent.endDate).format("L")}</Text>
      </Table.Td>
      <Table.Td>
        {lanEvent.paintCompoWinner && (
          <User userId={lanEvent.paintCompoWinner} users={data?.data} />
        )}
      </Table.Td>
      <Table.Td>
        {lanEvent.lanMaster && (
          <User userId={lanEvent.lanMaster} users={data?.data} />
        )}
      </Table.Td>
    </Table.Tr>
  );
}
