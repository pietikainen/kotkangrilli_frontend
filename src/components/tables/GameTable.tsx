import { Image } from "@mantine/core";
import { IconPhotoOff } from "@tabler/icons-react";
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
import { getLink } from "../../utils/getLink";

export default function GameTable({
  data,
  userProfiles,
}: {
  data: z.infer<typeof gameSchema>[];
  userProfiles: {
    id: number;
    username: string;
    snowflake: string;
    avatar: string;
  }[];
}) {
  const columns: MRT_ColumnDef<z.infer<typeof gameSchema>>[] = useMemo(
    () => [
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
          const user = userProfiles.find(
            (u: { id: number }) => u.id === cell.getValue<number>(),
          );
          return (
            <>
              {user?.avatar && (
                <Image
                  src={`https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.png?size=32`}
                  alt={`${user.username} avatar`}
                  mah={32}
                  w="auto"
                  fit="contain"
                />
              )}
              {user?.username}
            </>
          );
        },
      },
    ],
    [],
  );
  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
