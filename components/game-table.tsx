import {
    Table,
    TableBody,
    TableCaption, TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {Checkbox} from "@/components/ui/checkbox";
import useSWR from "swr";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";

const fetcher = (path: string) => fetch(`http://localhost:5000${path}`, {
    credentials: "include"
}).then((res) => res.json());

export default function GameTable() {
    const {data, error, isLoading} = useSWR('/api/games', fetcher);

    if (isLoading) return <p>Ladataaan...</p>;
    if (error) return <p>Virhe: {error.message}</p>;

    return (
        <Table>
            <TableCaption/>
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
                {data?.data.map((game: { gameExternalApiId: Key | null | undefined; gameName: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; gamePrice: number; gameStore: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; gameDescription: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; gameLink: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; gamePlayers: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; gameIsLan: any; gameSubmittedBy: number; }) => (
                    <TableRow key={game.gameExternalApiId}>
                        <TableCell className="font-medium">{game.gameName}</TableCell>
                        <TableCell>{game.gamePrice / 100}</TableCell>
                        <TableCell>{game.gameStore}</TableCell>
                        <TableCell>{game.gameDescription}</TableCell>
                        <TableCell>{game.gameLink}</TableCell>
                        <TableCell>{game.gamePlayers}</TableCell>
                        <TableCell>{game.gameIsLan ? "Kyllä" : "Ei"}</TableCell>
                        <TableCell>{game.gameSubmittedBy}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}