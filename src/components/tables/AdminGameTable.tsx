import { ActionIcon, Group, Image, Table, Text } from "@mantine/core";
import { IconEdit, IconPhotoOff, IconTrash } from "@tabler/icons-react";
import React from "react";
import { z } from "zod";
import gameSchema from "../../schemas/gameSchema";
import userSchema from "../../schemas/userSchema";
import { getLink } from "../../utils/getLink";

export default function AdminGameTable({
  data,
  users,
  onEdit,
  onDelete,
}: {
  data: z.infer<typeof gameSchema>[];
  users: z.infer<typeof userSchema>[];
  onEdit: (row: z.infer<typeof gameSchema>) => void;
  onDelete: (row: z.infer<typeof gameSchema>) => void;
}) {
  return (
    <Table.ScrollContainer minWidth={1300} type="native">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Ulkoinen ID</Table.Th>
            <Table.Th>Nimi</Table.Th>
            <Table.Th>Äänestysryhmä</Table.Th>
            <Table.Th>Hinta</Table.Th>
            <Table.Th>Kauppa</Table.Th>
            <Table.Th>Kuvaus</Table.Th>
            <Table.Th>Linkki</Table.Th>
            <Table.Th>Pelaajat</Table.Th>
            <Table.Th>LAN?</Table.Th>
            <Table.Th>Ehdottaja</Table.Th>
            <Table.Th>Toiminnot</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((game) => {
            const user = users.find(
              (candidate) => candidate.id === game.submittedBy,
            );

            return (
              <Table.Tr key={game.id}>
                <Table.Td>{game.id}</Table.Td>
                <Table.Td>{game.externalApiId}</Table.Td>
                <Table.Td>
                  <Group wrap="nowrap" align="center">
                    {game.image ? (
                      <Image
                        src={game.image}
                        alt="Kansikuva"
                        mah="64"
                        w="auto"
                        fit="contain"
                      />
                    ) : (
                      <IconPhotoOff />
                    )}
                    <Text fw={700}>{game.title}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{game.voteGroup || "—"}</Table.Td>
                <Table.Td>{game.price / 100} €</Table.Td>
                <Table.Td>{game.store}</Table.Td>
                <Table.Td>{game.description}</Table.Td>
                <Table.Td>{getLink(game.link, game.store)}</Table.Td>
                <Table.Td>{game.players}</Table.Td>
                <Table.Td>{game.isLan ? "Kyllä" : "Ei"}</Table.Td>
                <Table.Td>
                  <Group wrap="nowrap" align="center">
                    <Image
                      src={
                        user?.avatar
                          ? `https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.png?size=32`
                          : "https://cdn.discordapp.com/embed/avatars/0.png"
                      }
                      fallbackSrc="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt={`${user?.nickname || user?.username || "Käyttäjä"} avatar`}
                      mah={32}
                      w="auto"
                      fit="contain"
                    />
                    <span>{user?.nickname || user?.username || "—"}</span>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="filled"
                      aria-label="Muokkaa"
                      onClick={() => onEdit(game)}
                    >
                      <IconEdit />
                    </ActionIcon>
                    <ActionIcon
                      variant="filled"
                      aria-label="Poista"
                      onClick={() => onDelete(game)}
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
