import { useMemo } from 'react';
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { z } from 'zod';
import { eventSchema } from '@/schemas/event-chema';

export default function EventTable({ data }: { data: z.infer<typeof eventSchema>[] }) {
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
      },
      {
        accessorKey: 'startDate',
        header: 'Alkamispäivä',
      },
      {
        accessorKey: 'endDate',
        header: 'Päättymispäivä',
      },
      {
        accessorKey: 'votingOpen',
        header: 'Äänestys',
      },
      { accessorKey: 'active', header: 'Aktiivinen' },
      { accessorKey: 'lanMaster', header: 'LAN-mestari' },
      { accessorkey: 'paintCompoWinner', header: 'Paintcompo voittaja' },
      { accessorKey: 'organizer', header: '"Järjestäjä"' },
    ],
    []
  );

  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
