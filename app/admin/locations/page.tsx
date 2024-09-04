"use client";
import LocationTable from "@/components/admin/location-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LocationForm from "@/components/admin/location-form";

export default function Locations() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h2>Paikat</h2>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Lisää paikka</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tapahtuman tiedot</DialogTitle>
          </DialogHeader>
          <LocationForm setOpen={setOpen} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Sulje</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LocationTable />
    </div>
  );
}
