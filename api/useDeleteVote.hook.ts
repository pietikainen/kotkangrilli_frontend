import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteVote(id: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/votes/${id}`, {
    withCredentials: true,
  });
}

export default function useDeleteVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteVote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}
