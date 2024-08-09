import {
    Table,
    TableBody,
    TableCaption, TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import useSWR from "swr";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";

const fetcher = (path: string) => fetch(`http://localhost:5000/api${path}`, {
    credentials: "include"
}).then((res) => res.json());

export default function GameTable() {
    const { data, error, isLoading } = useSWR('/games', fetcher);
    const { data: userData, isLoading: isLoadingUsers } = useSWR('/users/user-profiles', fetcher);

    if (isLoading || isLoadingUsers) return <p>Ladataaan...</p>;
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
                {data?.data.map((game: { id: number, gameExternalApiId: number; gameName: string, gamePrice: number; gameStore: string; gameDescription: string | null | undefined; gameLink: string | null | undefined; gamePlayers: number; gameIsLan: boolean; gameSubmittedBy: number; }) => (
                    <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.gameName}</TableCell>
                        <TableCell>{game.gamePrice / 100}</TableCell>
                        <TableCell>{game.gameStore}</TableCell>
                        <TableCell>{game.gameDescription}</TableCell>
                        <TableCell>{game.gameLink}</TableCell>
                        <TableCell>{game.gamePlayers}</TableCell>
                        <TableCell>{game.gameIsLan ? "Kyllä" : "Ei"}</TableCell>
                        <TableCell><img src={`https://cdn.discordapp.com/avatars/${userData.find((user: { id: number; }) => user.id === game.gameSubmittedBy)?.discordId}/${userData.find((user: { id: number; }) => user.id === game.gameSubmittedBy)?.profilePicture}.png?size=24`} alt="avatar" />{userData.find((user: { id: number; }) => user.id === game.gameSubmittedBy)?.username}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}