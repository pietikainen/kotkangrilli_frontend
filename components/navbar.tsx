import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { House } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import React from "react";
import { useUser } from "@/lib/api";
import UserMenu from "@/components/user-menu";

export default function Navbar() {
  const { user, error, isLoading } = useUser({});

  if (isLoading || !user) return null;
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;

  return (
    <nav className="flex flex-row justify-between">
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
          {user.userlevel > 7 && (
            <NavigationMenuItem>
              <Link href="/admin" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Admin
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
      <ModeToggle className="me-12" />
      <UserMenu />
    </nav>
  );
}
