import { useMemo } from 'react';
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { z } from 'zod';
import locationSchema from '@/schemas/locationSchema';

export default function LocationTable({ data }: { data: z.infer<typeof locationSchema>[] }) {
  const columns: MRT_ColumnDef<z.infer<typeof locationSchema>>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Nimi',
      },
      {
        accessorKey: 'address',
        header: 'Osoite',
      },
      {
        accessorKey: 'city',
        header: 'Kaupunki',
      },
      {
        accessorKey: 'capacity',
        header: 'Kapasiteetti',
      },
      {
        accessorKey: 'description',
        header: 'Kuvaus',
      },
      {
        accessorKey: 'price',
        header: 'Hinta',
        Cell: ({ cell }) => `${cell.getValue<number>() / 100} €`,
      },
    ],
    []
  );

  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
