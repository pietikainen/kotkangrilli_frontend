import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putGame(gameId: number, game: any) {
  return axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/games/${gameId}`, game, {
    withCredentials: true,
  });
}

export default function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, game }: { gameId: number; game: any }) => putGame(gameId, game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
