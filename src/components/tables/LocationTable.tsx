import { Table } from "@mantine/core";
import React from "react";
import { z } from "zod";
import locationSchema from "../../schemas/locationSchema";

export default function LocationTable({
  data,
}: {
  data: z.infer<typeof locationSchema>[];
}) {
  return (
    <Table.ScrollContainer minWidth={800} type="native">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Nimi</Table.Th>
            <Table.Th>Osoite</Table.Th>
            <Table.Th>Kaupunki</Table.Th>
            <Table.Th>Kapasiteetti</Table.Th>
            <Table.Th>Kuvaus</Table.Th>
            <Table.Th>Hinta</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((location) => (
            <Table.Tr key={location.id}>
              <Table.Td>{location.id}</Table.Td>
              <Table.Td>{location.name}</Table.Td>
              <Table.Td>{location.address}</Table.Td>
              <Table.Td>{location.city}</Table.Td>
              <Table.Td>{location.capacity}</Table.Td>
              <Table.Td>{location.description}</Table.Td>
              <Table.Td>{location.price / 100} €</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
