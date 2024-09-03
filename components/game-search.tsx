"use client";

import { useEffect, useState } from "react";
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
import { ImageOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { router } from "next/client";

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

  useEffect(() => {
    if (!isLoading && error?.status === 401) router.push("/");
  }, [isLoading, error]);

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
            <LoadingSpinner />
          </div>
        )}
        {!isLoading && games?.length === 0 && title && (
          <div className="flex justify-center items-center mt-4">
            <div className="text-center text-gray-400">
              Joko peliä ei löytynyt tai löytyi liian monta. Tarkista
              oikeinkirjoitus tai tarkenna hakua.
            </div>
          </div>
        )}
        {!isLoading && games?.length > 0 && title && (
          <div className="absolute border border-gray-300 rounded-md shadow-md w-full mt-2 mb-20 z-40 dark:bg-slate-900 bg-slate-50 px-2">
            {games.map(
              (
                game: { id: number; coverImageUrl: string; name: string },
                i: number,
              ) => (
                <>
                  {i !== 0 && <Separator />}
                  <button
                    className="flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 w-full my-2"
                    onClick={() => {
                      setGame(game);
                      setOpen(true);
                    }}
                    key={game.id}
                  >
                    {game.coverImageUrl ? (
                      <Image
                        src={game.coverImageUrl}
                        alt="Kansikuva"
                        width={48}
                        height={64}
                        unoptimized={true}
                        className="mr-2"
                      />
                    ) : (
                      <ImageOff />
                    )}
                    <span>{game.name}</span>
                  </button>
                </>
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
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex flex-row items-center">
                    {game.coverImageUrl ? (
                      <Image
                        src={game.coverImageUrl}
                        alt="Kansikuva"
                        width={48}
                        height={64}
                        unoptimized={true}
                        className="mr-2"
                      />
                    ) : (
                      <ImageOff />
                    )}

                    <span>{game.name}</span>
                  </div>
                </DialogTitle>
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
