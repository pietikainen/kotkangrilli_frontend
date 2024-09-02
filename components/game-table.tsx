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
import { SiSteam, SiEpicgames } from "@icons-pack/react-simple-icons";
import { ImageOff, Link2Icon, Link2Off } from "lucide-react";
import { useEffect } from "react";
import { router } from "next/client";

function getLink(link: string | null | undefined) {
  if (link) {
    if (link.includes("steampowered.com")) {
      return (
        <a href={link}>
          <SiSteam />
        </a>
      );
    }
    if (link.includes("epicgames.com")) {
      return (
        <a href={link}>
          <SiEpicgames />
        </a>
      );
    }
    return (
      <a href={link}>
        <Link2Icon />
      </a>
    );
  }

  return <Link2Off />;
}

export default function GameTable() {
  const { data, error, isLoading } = useSWR("api/games", fetcher);
  const {
    data: userData,
    error: userError,
    isLoading: isLoadingUsers,
  } = useSWR("api/users/user-profiles", fetcher);

  useEffect(() => {
    if (!isLoading && error?.status === 401) router.push("/");
    if (!isLoadingUsers && userError?.status === 401) router.push("/");
  }, [isLoading, isLoadingUsers, error, userError]);

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
            image: string;
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
                <TableCell className="font-medium">
                  {game.image ? (
                    <Image
                      src={game.image}
                      alt="Kansikuva"
                      width={48}
                      height={64}
                      unoptimized={true}
                    />
                  ) : (
                    <ImageOff />
                  )}
                  {game.title}
                </TableCell>
                <TableCell>{game.price / 100}</TableCell>
                <TableCell>{game.store}</TableCell>
                <TableCell>{game.description}</TableCell>
                <TableCell>{getLink(game.link)}</TableCell>
                <TableCell>{game.players}</TableCell>
                <TableCell>{game.isLan ? "Kyllä" : "Ei"}</TableCell>
                <TableCell>
                  <Image
                    src={`https://cdn.discordapp.com/avatars/${
                      user.snowflake
                    }/${user.avatar}.png?size=24`}
                    alt={`${user.username} avatar`}
                    width={32}
                    height={32}
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
