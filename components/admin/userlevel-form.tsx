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

async function updateRole(
  path: string,
  {
    arg,
  }: {
    arg: { id: number; role: number };
  },
) {
  return fetch(`http://localhost:5000/${path}/${arg.id}/userlevel`, {
    method: "PATCH",
    body: JSON.stringify({ role: arg.role }),
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
      role: user?.userlevel || 1,
    },
  });
  const { trigger, isMutating } = useSWRMutation("api/users", updateRole);

  async function onSubmit(values: { role: number }) {
    if (user) {
      await trigger({
        id: user.id,
        role: values.role,
      });
      setOpen(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="role"
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
