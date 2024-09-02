"use client";
import { ModeToggle } from "@/components/mode-toggle";

import { fetcher, useUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import React, { useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { House, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, error, isLoading } = useUser({});
  const { trigger, isMutating, data } = useSWRMutation("auth/logout", fetcher);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (!isLoading && (!user || error?.status === 401)) router.push("/");
  }, [isLoading, error, user, router]);

  useEffect(() => {
    async function clearCache() {
      await mutate(() => true, undefined, { revalidate: false });
    }

    if (!isMutating && data) {
      clearCache();
      router.push("/");
    }
  }, [mutate, isMutating, data, router]);

  if (isLoading || !user) return <p>Ladataan...</p>;
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;

  return (
    <>
      <header className="flex flex-row justify-between">
        <h1 className="text-xl me-24">Kotkan grilin lani hasutus</h1>
        <NavigationMenu className="me-24">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/dashboard" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <House />
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/dashboard/game-suggestions" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Peliehdotukset
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle className="me-12" />
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
      </header>
      <main className="pt-16">{children}</main>
    </>
  );
}
