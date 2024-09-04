import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import React from "react";
import { useUser } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import RainbowText from "@/components/ui/rainbow-text";

export default function AdminNav() {
  const { user, error, isLoading } = useUser({});

  if (isLoading) return <LoadingSpinner />;
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;
  if (!user) return null;
  if (user.userlevel < 8) return null;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <RainbowText text="ADMIN" />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/admin/users" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Käyttäjät
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/admin/events" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Tapahtumat
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/admin/locations" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Paikat
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
