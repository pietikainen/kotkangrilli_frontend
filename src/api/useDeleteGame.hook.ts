import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function deleteGame(gameId: number) {
  return axios.delete(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/games/${gameId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: number) => deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}
