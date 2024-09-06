import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import gameSchema from '@/schemas/gameSchema';

async function postGame(game: z.infer<typeof gameSchema>) {
  return axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/games`, game, {
    withCredentials: true,
  });
}

export default function useAddGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (game: z.infer<typeof gameSchema>) => postGame(game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
