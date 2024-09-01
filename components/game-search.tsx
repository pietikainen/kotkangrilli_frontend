"use client";

import { useState } from "react";
import Image from "next/image";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { useGamesSearch } from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GameForm from "@/components/game-form";

export default function GameSearch() {
  const [title, setTitle] = useState("");
  const { games, error, isLoading } = useGamesSearch(title);
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState<{
    id: number;
    coverImageUrl: string;
    name: string;
  } | null>(null);

  const handleSearch = useDebouncedCallback((term: string) => {
    setTitle(term);
  }, 500);

  return (
    <div className="relative flex flex-col items-center mb-10 mt-10">
      <div className="relative w-full">
        <Input
          className="text-xl h-16 w-full"
          placeholder="Ehdota peliä..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isLoading && title && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 m-8"></div>
          </div>
        )}
        {!isLoading && games && title && (
          <div className="absolute border border-gray-300 rounded-md shadow-md w-full mt-2 mb-20 z-40 dark:bg-slate-900 bg-slate-50 px-2">
            {games.data.map(
              (game: { id: number; coverImageUrl: string; name: string }) => (
                <button
                  className="flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 w-full my-2"
                  onClick={() => {
                    setGame(game);
                    setOpen(true);
                  }}
                  key={game.id}
                >
                  <Image
                    src={game.coverImageUrl}
                    alt="Kansikuva"
                    width={48}
                    height={64}
                    unoptimized={true}
                    className="mr-2"
                  />
                  <span>{game.name}</span>
                </button>
              ),
            )}
          </div>
        )}
        {game && (
          <Dialog
            key={game.id}
            open={open}
            onOpenChange={(value) => setOpen(value)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{game.name}</DialogTitle>
              </DialogHeader>
              <GameForm game={game} setOpen={setOpen} setTitle={setTitle} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Sulje</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
