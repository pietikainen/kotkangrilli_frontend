"use client";

import { useUser } from "@/lib/api";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import React from "react";

export default function Dashboard() {
  const { user, error, isLoading } = useUser({});

  if (isLoading)
    return (
      <div className="flex items-center">
        <LoadingSpinner />
        <span>Ladataan...</span>
      </div>
    );
  if (error) return <p>Virhe: {error.message}</p>;
  if (!user) redirect("/");

  return <p>Tähän tulee kaikkea hassua</p>;
}
