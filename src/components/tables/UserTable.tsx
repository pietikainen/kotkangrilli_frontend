import { Table } from "@mantine/core";
import React from "react";
import { z } from "zod";
import userSchema from "../../schemas/userSchema";

export default function UserTable({
  data,
}: {
  data: z.infer<typeof userSchema>[];
}) {
  return (
    <Table.ScrollContainer minWidth={900} type="native">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Discord ID</Table.Th>
            <Table.Th>Käyttäjä</Table.Th>
            <Table.Th>Nimimerkki</Table.Th>
            <Table.Th>Avatar</Table.Th>
            <Table.Th>Sähköposti</Table.Th>
            <Table.Th>Puhelin</Table.Th>
            <Table.Th>Tilinumero</Table.Th>
            <Table.Th>Taso</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.id}</Table.Td>
              <Table.Td>{user.snowflake}</Table.Td>
              <Table.Td>{user.username}</Table.Td>
              <Table.Td>{user.nickname}</Table.Td>
              <Table.Td>{user.avatar}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>{user.phone}</Table.Td>
              <Table.Td>{user.bankaccount}</Table.Td>
              <Table.Td>{user.userlevel}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
