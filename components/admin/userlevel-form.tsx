import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { userSchema } from "@/schemas/user-schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/button";

async function updateUserLevel(
  path: string,
  {
    arg,
  }: {
    arg: { id: number; userlevel: number };
  },
) {
  return fetch(`http://localhost:5000/${path}/${arg.id}/userlevel`, {
    method: "PATCH",
    body: JSON.stringify({ userlevel: arg.userlevel }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export default function UserLevelForm({
  user,
  setOpen,
}: {
  user: z.infer<typeof userSchema>;
  setOpen: (open: boolean) => void;
}) {
  const form = useForm({
    defaultValues: {
      id: user?.id,
      userlevel: user?.userlevel || 1,
    },
  });
  const { trigger, isMutating } = useSWRMutation("api/users", updateUserLevel);

  async function onSubmit(values: { userlevel: number }) {
    if (user) {
      await trigger({
        id: user.id,
        userlevel: values.userlevel,
      });
      setOpen(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="userlevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Käyttäjätaso</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="9" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Tallenna</Button>
      </form>
    </Form>
  );
}
