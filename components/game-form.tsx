import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gameSchema } from "@/schemas/game-schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import useSWRMutation from "swr/mutation";

async function addGame(
  path: string,
  {
    arg,
  }: {
    arg: {
      externalApiId: number;
      title: string;
      price: number;
      store: string;
      description: string | undefined;
      link: string | undefined;
      players: number;
      isLan: boolean;
    };
  },
) {
  return fetch(`http://localhost:5000${path}`, {
    method: "POST",
    body: JSON.stringify(arg),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export default function GameForm({
  game,
  setOpen,
  setTitle,
}: {
  game: { id: number; name: string };
  setOpen: (value: boolean) => void;
  setTitle: (value: string) => void;
}) {
  const form = useForm<z.infer<typeof gameSchema>>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      externalApiId: game.id,
      title: game.name,
      price: 0,
      store: "",
      description: "",
      link: "",
      players: 16,
      isLan: true,
    },
  });

  const { trigger, isMutating } = useSWRMutation("/api/games", addGame);

  async function onSubmit(values: z.infer<typeof gameSchema>) {
    await trigger({
      externalApiId: values.externalApiId,
      title: values.title,
      price: values.price * 100,
      store: values.store,
      description: values.description,
      link: values.link,
      players: values.players,
      isLan: values.isLan,
    });

    setTitle("");
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-3 gap-4"
      >
        <FormField
          control={form.control}
          name="externalApiId"
          render={() => <></>}
        />
        <FormField control={form.control} name="title" render={() => <></>} />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
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
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kauppa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kuvaus</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linkki</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="players"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pelaajat</FormLabel>
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
          name="isLan"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  {...field}
                  value={field.value ? "true" : "false"}
                  defaultChecked={true}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Onko peli LAN?</FormLabel>
                <FormDescription />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="h-100">
          Lähetä
        </Button>
      </form>
    </Form>
  );
}
