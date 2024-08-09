"use client";
import { ModeToggle } from "@/components/mode-toggle";
import GameForm from "@/components/game-form";
import GameTable from "@/components/game-table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import useSWR from "swr";

const fetcher = (path: string) =>
  fetch(`http://localhost:5000/api${path}`, {
    credentials: "include",
  }).then((res) => res.json());

function useUser() {
  const { data, error, isLoading } = useSWR("/users/me", fetcher);
  return { user: data, error, isLoading };
}

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (!user)
    return (
      <Link
        className={buttonVariants({ variant: "outline" })}
        href="http://localhost:5000/auth/discord"
      >
        Kirjaudu sisään
      </Link>
    );
  if (isLoading) return <p>Ladataaan...</p>;
  if (error) return <p>Virhe: {error.message}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-xl">Kotkan grilin lani hasutus</h1>
      <h2>Moi {user.username}!</h2>
      <div>
        <ModeToggle />
      </div>
      <div>
        <GameForm />
      </div>
      <div>
        <GameTable />
      </div>
    </main>
  );
}
