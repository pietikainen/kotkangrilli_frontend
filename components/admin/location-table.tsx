import React from "react";
import { z } from "zod";
import { useLocations } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { locationSchema } from "@/schemas/location-schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LocationTable() {
  const { locations, error, isLoading } = useLocations();

  if (isLoading)
    return (
      <div className="flex items-center">
        <LoadingSpinner />
        <span>Ladataan...</span>
      </div>
    );
  if (error) return <p>Virhe: {error.message}</p>;

  const columns: ColumnDef<z.infer<typeof locationSchema>>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Nimi" },
    { accessorKey: "address", header: "Osoite" },
    { accessorKey: "city", header: "Kaupunki" },
    { accessorKey: "capacity", header: "Kapasiteetti" },
    { accessorKey: "description", header: "Kuvaus" },
    { accessorKey: "price", header: "Hinta" },
  ];

  return <DataTable columns={columns} data={locations} />;
}
