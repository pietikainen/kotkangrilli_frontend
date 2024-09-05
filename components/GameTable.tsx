import { useMemo } from 'react';
import { SiEpicgames, SiGogdotcom, SiUbisoft } from '@icons-pack/react-simple-icons';
import {
  IconBrandSteam,
  IconBrandXbox,
  IconLink,
  IconLinkOff,
  IconPhotoOff,
} from '@tabler/icons-react';
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table';
import { z } from 'zod';
import { ActionIcon, Image } from '@mantine/core';
import { gameSchema } from '@/schemas/game-schema';

function getLink(link: string | null | undefined) {
  if (link) {
    if (link.includes('steampowered.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <IconBrandSteam />
        </ActionIcon>
      );
    }
    if (link.includes('gog.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <SiGogdotcom />
        </ActionIcon>
      );
    }
    if (link.includes('epicgames.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <SiEpicgames />
        </ActionIcon>
      );
    }
    if (link.includes('ubisoft.com') || link.includes('ubi.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <SiUbisoft />
        </ActionIcon>
      );
    }
    if (link.includes('xbox.com') || link.includes('microsoft.com')) {
      return (
        <ActionIcon component="a" href={link} target="_blank">
          <IconBrandXbox />
        </ActionIcon>
      );
    }
    return (
      <ActionIcon component="a" href={link} target="_blank">
        <IconLink />
      </ActionIcon>
    );
  }

  return <IconLinkOff />;
}

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
              <Image
                src={`https://cdn.discordapp.com/avatars/${
                  user.snowflake
                }/${user.avatar}.png?size=32`}
                alt={`${user.username} avatar`}
                mah={32}
                w="auto"
                fit="contain"
              />
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
