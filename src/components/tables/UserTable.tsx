import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import React, { useMemo } from "react";
import { z } from "zod";
import userSchema from "../../schemas/userSchema";

export default function UserTable({
  data,
}: {
  data: z.infer<typeof userSchema>[];
}) {
  const columns: MRT_ColumnDef<z.infer<typeof userSchema>>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "snowflake",
        header: "Discord ID",
      },
      {
        accessorKey: "username",
        header: "Käyttäjä",
      },
      {
        accessorKey: "nickname",
        header: "Nimimerkki",
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
        header: "Puhelin",
      },
      {
        accessorKey: "bankaccount",
        header: "Tilinumero",
      },
      {
        accessorKey: "userlevel",
        header: "Taso",
      },
    ],
    [],
  );

  const table = useMantineReactTable({ columns, data });

  return <MantineReactTable table={table} />;
}
