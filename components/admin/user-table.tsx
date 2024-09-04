import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUsers } from "@/lib/api";
import { z } from "zod";
import { userSchema } from "@/schemas/user-schema";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserLevelForm from "@/components/admin/userlevel-form";

export default function UserTable() {
  const { users, error, isLoading } = useUsers();
  const [user, setUser] = useState<z.infer<typeof userSchema>>();
  const [open, setOpen] = useState(false);

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
    {
      header: "Pikatoiminnot",
      cell: ({ row }) => (
        <Button
          onClick={() => {
            setUser(row.original);
            setOpen(true);
          }}
        >
          Muokkaa
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={users} />
      {user && open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{user.username}</DialogTitle>
            </DialogHeader>
            <UserLevelForm user={user} setOpen={setOpen} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Sulje</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
