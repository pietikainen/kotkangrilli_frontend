import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import gameSchema from "../schemas/gameSchema";

async function putGame(gameId: number, game: z.infer<typeof gameSchema>) {
  return axios.put(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/games/${gameId}`,
    game,
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      game,
    }: {
      gameId: number;
      game: z.infer<typeof gameSchema>;
    }) => putGame(gameId, game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}
