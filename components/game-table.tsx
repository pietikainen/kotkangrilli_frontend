"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSWR from "swr";
import Image from "next/image";
import { fetcher } from "@/lib/api";

export default function GameTable() {
  const { data, error, isLoading } = useSWR("api/games", fetcher);
  const { data: userData, isLoading: isLoadingUsers } = useSWR(
    "api/users/user-profiles",
    fetcher,
  );

  if (isLoading || isLoadingUsers) return <p>Ladataan...</p>;
  if (error) return <p>Virhe: {error.message}</p>;

  return (
    <Table>
      <TableCaption />
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Nimi</TableHead>
          <TableHead>Hinta (€)</TableHead>
          <TableHead>Kauppa</TableHead>
          <TableHead>Kuvaus</TableHead>
          <TableHead>Linkki</TableHead>
          <TableHead>Pelaajat</TableHead>
          <TableHead>LAN?</TableHead>
          <TableHead>Ehdottaja</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.data.map(
          (game: {
            id: number;
            externalApiId: number;
            title: string;
            price: number;
            store: string;
            description: string | null | undefined;
            link: string | null | undefined;
            players: number;
            isLan: boolean;
            submittedBy: number;
          }) => {
            const user = userData.find(
              (user: { id: number }) => user.id === game.submittedBy,
            );

            return (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.price / 100}</TableCell>
                <TableCell>{game.store}</TableCell>
                <TableCell>{game.description}</TableCell>
                <TableCell>{game.link}</TableCell>
                <TableCell>{game.players}</TableCell>
                <TableCell>{game.isLan ? "Kyllä" : "Ei"}</TableCell>
                <TableCell>
                  <Image
                    src={`https://cdn.discordapp.com/avatars/${
                      user.snowflake
                    }/${user.avatar}.png?size=24`}
                    alt={`${user.username} avatar`}
                    width={24}
                    height={24}
                    unoptimized={true}
                  />
                  {user.username}
                </TableCell>
              </TableRow>
            );
          },
        )}
      </TableBody>
    </Table>
  );
}
