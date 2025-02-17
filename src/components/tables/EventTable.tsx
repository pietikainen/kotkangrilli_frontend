import { ActionIcon, Group } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  MantineReactTable,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  useMantineReactTable,
} from "mantine-react-table";
import React, { useMemo } from "react";
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
  const columns: MRT_ColumnDef<z.infer<typeof eventSchema>>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "title",
        header: "Nimi",
      },
      {
        accessorKey: "description",
        header: "Kuvaus",
      },
      {
        accessorKey: "location",
        header: "Paikka",
        Cell: ({ cell }) => {
          const location = locations.find(
            (l: { id?: number }) =>
              l.id !== undefined && l.id === cell.getValue(),
          );
          return location?.name || "—";
        },
      },
      {
        accessorKey: "startDate",
        header: "Alkamispäivä",
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return date ? dayjs(date).format("L LT") : "—";
        },
      },
      {
        accessorKey: "endDate",
        header: "Päättymispäivä",
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return date ? dayjs(date).format("L LT") : "—";
        },
      },
      {
        accessorKey: "votingState",
        header: "Äänestys",
        Cell: ({ cell }) => getVotingState(cell.getValue<number>()),
      },
      {
        accessorKey: "active",
        header: "Aktiivinen",
        Cell: ({ cell }) => (cell.getValue() ? "Kyllä" : "Ei"),
      },
      {
        accessorKey: "winnerGamesCount",
        header: "Pelejä",
        Cell: ({ cell }: { cell: MRT_Cell<z.infer<typeof eventSchema>> }) =>
          cell.getValue<number | undefined>() || "—",
      },
      {
        accessorKey: "lanMaster",
        header: "LAN-mestari",
        Cell: ({ cell }: { cell: MRT_Cell<z.infer<typeof eventSchema>> }) => {
          const userId = cell.getValue<number>();
          if (!userId) return "—";
          return <User userId={userId} users={users} />;
        },
      },
      {
        accessorKey: "paintCompoWinner",
        header: "Paintcompo voittaja",
        Cell: ({ cell }: { cell: MRT_Cell<z.infer<typeof eventSchema>> }) => {
          const userId = cell.getValue<number>();
          if (!userId) return "—";
          return <User userId={userId} users={users} />;
        },
      },
      {
        accessorKey: "organizer",
        header: '"Järjestäjä"',
        Cell: ({ cell }: { cell: MRT_Cell<z.infer<typeof eventSchema>> }) => {
          const userId = cell.getValue<number>();
          if (!userId) return "—";
          return <User userId={userId} users={users} />;
        },
      },
      {
        id: "actions",
        header: "Toiminnot",
        Cell: ({ row }: { row: MRT_Row<z.infer<typeof eventSchema>> }) => (
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
