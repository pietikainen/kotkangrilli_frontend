"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {gameSchema} from "@/schemas/game-schema";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel, FormMessage
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Textarea} from "@/components/ui/textarea";
import useSWRMutation from "swr/mutation";

async function addGame(path: string, { arg }: { arg: { gameExternalApiId: number, gameName: string,
    gamePrice: number, gameStore: string, gameDescription: string | undefined, gameLink: string | undefined, gamePlayers: number,
    gameIsLan: boolean } }) {
    console.log(arg)
    return fetch(`http://localhost:5000${path}`, {
        method: 'POST',
        body: JSON.stringify(arg),
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}

export default function GameForm() {
    const form = useForm<z.infer<typeof gameSchema>>({
        resolver: zodResolver(gameSchema),
        defaultValues: { gameName: "", gamePrice: 0, gameStore: "", gameDescription: "", gameLink: "", gamePlayers: 2, gameIsLan: true },
    })

    const { trigger, isMutating } = useSWRMutation('/api/games', addGame)

    async function onSubmit(values: z.infer<typeof gameSchema>) {
        const result = await trigger({ gameExternalApiId: 1234, gameName: values.gameName, gamePrice: values.gamePrice * 100, gameStore: values.gameStore, gameDescription: values.gameDescription, gameLink: values.gameLink, gamePlayers: values.gamePlayers, gameIsLan: values.gameIsLan })
        console.log(result)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="gameName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pelin nimi</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="gamePrice" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hinta (€)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="gameStore"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kaupat</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="gameDescription" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kuvaus</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormDescription />
                            <FormMessage />
                        </FormItem>
                    )} />
                <FormField control={form.control} name="gameLink" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Linkki</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="gamePlayers" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pelaajat</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="gameIsLan" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Onko peli LAN?</FormLabel>
                        <FormControl>
                            <Checkbox {...field} />
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit">Lähetä</Button>
            </form>
        </Form>
    )
}