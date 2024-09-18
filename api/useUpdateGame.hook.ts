import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putEvent(gameId: number, game: any) {
  return axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/games/${gameId}`, game, {
    withCredentials: true,
  });
}

export default function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, game }: { gameId: number; game: any }) => putEvent(gameId, game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
