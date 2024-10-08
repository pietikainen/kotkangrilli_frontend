import { useMemo } from 'react';
import { IconPhotoOff } from '@tabler/icons-react';
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { z } from 'zod';
import { Image } from '@mantine/core';
import gameSchema from '@/schemas/gameSchema';
import { getLink } from '@/utils/getLink';

export default function GameTable({
  data,
  userProfiles,
}: {
  data: z.infer<typeof gameSchema>[];
  userProfiles: any[];
}) {
  const columns: MRT_ColumnDef<z.infer<typeof gameSchema>>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Nimi',
        Cell: ({ row }) => (
          <>
            {row.original.image ? (
              <Image src={row.original.image} alt="Kansikuva" mah="64" w="auto" fit="contain" />
            ) : (
              <IconPhotoOff />
            )}
            <b>{row.original.title}</b>
          </>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Hinta',
        Cell: ({ cell }) => `${cell.getValue<number>() / 100} €`,
      },
      { accessorKey: 'store', header: 'Kauppa' },
      { accessorKey: 'description', header: 'Kuvaus' },
      {
        accessorKey: 'link',
        header: 'Linkki',
        Cell: ({ cell }) => getLink(cell.getValue<string>()),
      },
      { accessorKey: 'players', header: 'Pelaajat' },
      {
        accessorKey: 'isLan',
        header: 'LAN?',
        Cell: ({ cell }) => (cell.getValue() ? 'Kyllä' : 'Ei'),
      },
      {
        accessorKey: 'submittedBy',
        header: 'Ehdottaja',
        Cell: ({ cell }) => {
          const user = userProfiles.find((u: { id: number }) => u.id === cell.getValue<number>());
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
              {user.username}
            </>
          );
        },
      },
    ],
    []
  );
  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
