"use client";

import { useUser } from "@/lib/api";
import { redirect } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import React from "react";
import UserTable from "@/components/admin/user-table";
import EventTable from "@/components/admin/event-table";

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

  return (
    <div>
      <h2>Käyttäjät</h2>
      <UserTable />
      <h2>Tapahtumat</h2>
      <EventTable />
    </div>
  );
}
