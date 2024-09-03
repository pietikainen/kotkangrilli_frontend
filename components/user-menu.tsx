import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import React, { useEffect } from "react";
import { fetcher, useUser } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { user, error, isLoading } = useUser({});
  const { trigger, isMutating, data } = useSWRMutation("auth/logout", fetcher);

  useEffect(() => {
    async function clearCache() {
      await mutate(() => true, undefined, { revalidate: false });
    }

    if (!isMutating && data) {
      clearCache();
      router.push("/");
    }
  }, [mutate, isMutating, data, router]);

  if (isLoading) <LoadingSpinner />;
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Avatar className="me-2">
            <AvatarImage
              src={`https://cdn.discordapp.com/avatars/${user.snowflake}/${user.avatar}.webp?size=24`}
              alt={`${user.username} avatar`}
              width={24}
              height={24}
            />
          </Avatar>
          <span>{user.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={() => trigger()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Kirjaudu ulos</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
