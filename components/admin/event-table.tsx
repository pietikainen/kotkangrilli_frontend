import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEvents } from "@/lib/api";
import { z } from "zod";

import { DataTable } from "@/components/ui/data-table";
import { eventSchema } from "@/schemas/event-chema";

export default function EventTable() {
  const { events, error, isLoading } = useEvents();

  if (isLoading)
    return (
      <div className="flex items-center">
        <LoadingSpinner />
        <span>Ladataan...</span>
      </div>
    );
  if (error) return <p>Virhe: {error.message}</p>;

  const columns: ColumnDef<z.infer<typeof eventSchema>>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Nimi" },
    { accessorKey: "description", header: "Kuvaus" },
    { accessorKey: "location", header: "Paikka" },
    { accessorKey: "startDate", header: "Alku" },
    { accessorKey: "endDate", header: "Loppu" },
    { accessorKey: "votingOpen", header: "Äänestys" },
    { accessorKey: "active", header: "Aktiivinen" },
    { accessorKey: "lanMaster", header: "Lan Master" },
    { accessorKey: "paintCompoWinner", header: "Paint voittaja" },
    { accessorKey: "organizer", header: "Järjestäjä" },
  ];

  return <DataTable columns={columns} data={events} />;
}
