"use client";
import EventTable from "@/components/admin/event-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import EventForm from "@/components/admin/event-form";
import { Button } from "@/components/ui/button";

export default function Events() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h2>Tapahtumat</h2>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Lisää tapahtuma</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tapahtuman tiedot</DialogTitle>
          </DialogHeader>
          <EventForm setOpen={setOpen} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Sulje</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EventTable />
    </div>
  );
}
