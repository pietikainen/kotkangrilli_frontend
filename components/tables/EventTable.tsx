import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useMemo } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { z } from 'zod';
import { ActionIcon, Group, Image } from '@mantine/core';
import eventSchema from '@/schemas/eventSchema';
import locationSchema from '@/schemas/locationSchema';
import userSchema from '@/schemas/userSchema';

import 'dayjs/locale/fi';

dayjs.locale('fi');
dayjs.extend(localizedFormat);

function User({ userId, users }: { userId: number; users: z.infer<typeof userSchema>[] }) {
  const user = users.find((u: { id?: number }) => u.id !== undefined && u.id === userId);
  return (
    <>
      <Image
        src={`https://cdn.discordapp.com/avatars/${user?.snowflake}/${user?.avatar}.png?size=32`}
        alt={`${user?.username} avatar`}
        mah={32}
        w="auto"
        fit="contain"
      />
      {user?.username}
    </>
  );
}

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
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'title',
        header: 'Nimi',
      },
      {
        accessorKey: 'description',
        header: 'Kuvaus',
      },
      {
        accessorKey: 'location',
        header: 'Paikka',
        Cell: ({ cell }) => {
          const location = locations.find(
            (l: { id?: number }) => l.id !== undefined && l.id === cell.getValue()
          );
          return location?.name || '—';
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Alkamispäivä',
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return date ? dayjs(date).format('L LT') : '—';
        },
      },
      {
        accessorKey: 'endDate',
        header: 'Päättymispäivä',
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return date ? dayjs(date).format('L LT') : '—';
        },
      },
      {
        accessorKey: 'votingOpen',
        header: 'Äänestys',
        Cell: ({ cell }) => (cell.getValue() ? 'Kyllä' : 'Ei'),
      },
      {
        accessorKey: 'active',
        header: 'Aktiivinen',
        Cell: ({ cell }) => (cell.getValue() ? 'Kyllä' : 'Ei'),
      },
      {
        accessorKey: 'winnerGamesCount',
        header: 'Pelejä',
        Cell: ({ cell }) => <span>{cell.getValue<number | undefined>() || '—'}</span>,
      },
      {
        accessorKey: 'lanMaster',
        header: 'LAN-mestari',
        Cell: ({ cell }) => {
          const userId = cell.getValue<number>();
          if (!userId) return '—';
          return <User userId={userId} users={users} />;
        },
      },
      {
        accessorKey: 'paintCompoWinner',
        header: 'Paintcompo voittaja',
        Cell: ({ cell }) => {
          const userId = cell.getValue<number>();
          if (!userId) return '—';
          return <User userId={userId} users={users} />;
        },
      },
      {
        accessorKey: 'organizer',
        header: '"Järjestäjä"',
        Cell: ({ cell }) => {
          const userId = cell.getValue<number>();
          if (!userId) return '—';
          return <User userId={userId} users={users} />;
        },
      },
      {
        id: 'actions',
        header: 'Toiminnot',
        Cell: ({ row }) => (
          <Group>
            <ActionIcon variant="filled" aria-label="Muokkaa" onClick={() => onEdit(row.original)}>
              <IconEdit />
            </ActionIcon>
            <ActionIcon variant="filled" aria-label="Poista" onClick={() => onDelete(row.original)}>
              <IconTrash />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
