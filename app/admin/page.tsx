"use client";

import { useUser } from "@/lib/api";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import React from "react";

export default function Admin() {
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
  if (user.userlevel < 2) redirect("/");

  return <div>Sinulla on voima muuttaa kaiken</div>;
}
