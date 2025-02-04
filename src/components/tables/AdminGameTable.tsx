import { ActionIcon, Group, Image } from "@mantine/core";
import { IconEdit, IconPhotoOff, IconTrash } from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  useMantineReactTable,
} from "mantine-react-table";
import React, { useMemo } from "react";
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
  const columns: MRT_ColumnDef<z.infer<typeof gameSchema>>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "externalApiId",
        header: "Ulkoinen ID",
      },
      {
        accessorKey: "title",
        header: "Nimi",
        Cell: ({ row }: { row: MRT_Row<z.infer<typeof gameSchema>> }) => (
          <>
            {row.original.image ? (
              <Image
                src={row.original.image}
                alt="Kansikuva"
                mah="64"
                w="auto"
                fit="contain"
              />
            ) : (
              <IconPhotoOff />
            )}
            <b>{row.original.title}</b>
          </>
        ),
      },
      {
        accessorKey: "price",
        header: "Hinta",
        Cell: ({ cell }) => `${cell.getValue<number>() / 100} €`,
      },
      { accessorKey: "store", header: "Kauppa" },
      { accessorKey: "description", header: "Kuvaus" },
      {
        accessorKey: "link",
        header: "Linkki",
        Cell: ({ cell, row }) =>
          getLink(cell.getValue<string>(), row.original.store),
      },
      { accessorKey: "players", header: "Pelaajat" },
      {
        accessorKey: "isLan",
        header: "LAN?",
        Cell: ({ cell }) => (cell.getValue() ? "Kyllä" : "Ei"),
      },
      {
        accessorKey: "submittedBy",
        header: "Ehdottaja",
        Cell: ({ cell }: { cell: MRT_Cell<z.infer<typeof gameSchema>> }) => {
          const user = users.find(
            (u: { id?: number }) =>
              u.id !== undefined && u.id === cell.getValue<number>(),
          );
          return (
            <>
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  user?.snowflake
                }/${user?.avatar}.png?size=32`}
                alt={`${user?.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
              {user?.username}
            </>
          );
        },
      },
      {
        header: "Toiminnot",
        Cell: ({ row }: { row: MRT_Row<z.infer<typeof gameSchema>> }) => (
          <Group>
            <ActionIcon
              variant="filled"
              aria-label="Muokkaa"
              onClick={() => onEdit(row.original)}
            >
              <IconEdit />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              aria-label="Poista"
              onClick={() => onDelete(row.original)}
            >
              <IconTrash />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [],
  );

  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
