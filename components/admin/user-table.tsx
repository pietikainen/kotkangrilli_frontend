import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUsers } from "@/lib/api";
import { z } from "zod";
import { userSchema } from "@/schemas/user-schema";
import { DataTable } from "@/components/ui/data-table";

export default function UserTable() {
  const { users, error, isLoading } = useUsers();

  if (isLoading)
    return (
      <div className="flex items-center">
        <LoadingSpinner />
        <span>Ladataan...</span>
      </div>
    );
  if (error) return <p>Virhe: {error.message}</p>;

  const columns: ColumnDef<z.infer<typeof userSchema>>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "snowflake",
      header: "Snowflake",
    },
    {
      accessorKey: "username",
      header: "Käyttäjänimi",
    },
    {
      accessorKey: "nickname",
      header: "Nimi",
    },
    {
      accessorKey: "avatar",
      header: "Avatar",
    },
    {
      accessorKey: "email",
      header: "Sähköposti",
    },
    {
      accessorKey: "phone",
      header: "Puhelinnumero",
    },
    {
      accessorKey: "bankaccount",
      header: "Pankki",
    },
    {
      accessorKey: "userlevel",
      header: "Käyttäjätaso",
    },
  ];

  return <DataTable columns={columns} data={users} />;
}
