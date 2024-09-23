import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postVote({ eventId, gameId }: { eventId: number; gameId: number }) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/votes/${eventId}/${gameId}`,
    {},
    {
      withCredentials: true,
    }
  );
}

export default function useAddVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, gameId }: { eventId: number; gameId: number }) =>
      postVote({
        eventId,
        gameId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}
