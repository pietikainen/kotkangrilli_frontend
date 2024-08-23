"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gameSchema } from "@/schemas/game-schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import useSWRMutation from "swr/mutation";
import { useState, useEffect, useRef } from "react";

async function addGame(
  path: string,
  {
    arg,
  }: {
    arg: {
      externalApiId: number;
      title: string;
      price: number;
      store: string;
      description: string | undefined;
      link: string | undefined;
      players: number;
      isLan: boolean;
    };
  },
) {
  return fetch(`http://localhost:5000${path}`, {
    method: "POST",
    body: JSON.stringify(arg),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

function debounce(func: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

interface GameFormProps {
  onOpenDialog: (title: string, coverImageUrl: string) => void;
}

export default function GameForm({ onOpenDialog }: GameFormProps) {
  const form = useForm<z.infer<typeof gameSchema>>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      price: 0,
      store: "",
      description: "",
      link: "",
      players: 2,
      isLan: true,
    },
  });

  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [gameSelected, setGameSelected] = useState(false);
  const [dropdownData, setDropdownData] = useState<
    { id: string; name: string; coverImageUrl: string }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedFetch = useRef(debounce(fetchData, 300)).current;

  useEffect(() => {
    if (title.length > 2) {
      debouncedFetch(title);
    } else {
      setShowDropdown(false);
    }
  }, [title]);

  async function fetchData(title: string) {
    setLoading(true);
    await fetch(`http://localhost:5000/api/games/search/${title}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && Array.isArray(data.data)) {
          const gamesWithCovers = await Promise.all(
            data.data.map(async (game: any) => {
              const coverUrl = await fetchGameCover(game.id);
              return { ...game, coverImageUrl: coverUrl };
            }),
          );
          setDropdownData(gamesWithCovers);
        } else {
          setDropdownData([]);
        }
        setShowDropdown(true);
      })
      .catch(() => {
        setDropdownData([]);
        setShowDropdown(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const fetchGameCover = async (externalApiId: number) => {
    console.log("Fetching cover from external API", externalApiId);
    return await fetch(
      `http://localhost:5000/proxy/?url=https://api.igdb.com/v4/covers`,
      {
        method: "POST",
        body: JSON.stringify({
          query: `fields url; where game = ${externalApiId}; limit 1;`,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          let coverUrl = data[0].url;
          coverUrl = coverUrl.replace("t_thumb", "t_cover_big");
          setCover(coverUrl);
          console.log(coverUrl);
          return coverUrl;
        }
        return "";
      })
      .catch((error) => {
        setCover("");
        console.log("Error fetching cover: ", error);
        return "";
      });
  };

  const { trigger, isMutating } = useSWRMutation("/api/games", addGame);

  async function onSubmit(values: z.infer<typeof gameSchema>) {
    await trigger({
      externalApiId: 1234,
      title: values.title,
      price: values.price * 100,
      store: values.store,
      description: values.description,
      link: values.link,
      players: values.players,
      isLan: values.isLan,
    });
  }

  return (
    <div className="relative flex flex-col items-center mb-80 mt-10">
      <div className="relative w-full">
        <Input
          className="text-xl h-16 w-full"
          value={title}
          placeholder="Ehdota peliä..."
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value === "") {
              setShowDropdown(false);
              setDropdownData([]);
            }
          }}
          onKeyDown={(e) => {
            setShowDropdown(true);
          }}
          onBlur={() => {
            setShowDropdown(false);
          }}
          onFocus={() => {
            setGameSelected(false);
          }}
        />
        {showDropdown && !gameSelected && (
          <div className="absolute border border-gray-300 rounded-md shadow-md w-full mt-2 mb-20 z-10">
            {loading && (
              <div className="flex justify-center items-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 m-8"></div>
              </div>
            )}

            {dropdownData.map((data) => (
              <div
                key={data.id}
                className="p-2 flex items-center cursor-pointer"
                onMouseDown={() => {
                  setTitle(data.name);
                  setCover(data.coverImageUrl); // Ensure cover is set
                  setGameSelected(true);
                  setShowDropdown(false);

                  // Open Dialog with game data
                  onOpenDialog(data.name, data.coverImageUrl);
                }}
              >
                <div className="h-16 w-12 mr-2">
                  <img src={data.coverImageUrl} className="h-full w-full" />
                </div>
                <span>{data.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
