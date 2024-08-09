"use client";

import { useUser } from "@/lib/api";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { user, error, isLoading } = useUser({});

  if (isLoading) return <p>Ladataan...</p>;
  if (error) return <p>Virhe: {error.message}</p>;
  if (!user) redirect("/");

  return <p>Tähän tulee kaikkea hassua</p>;
}
