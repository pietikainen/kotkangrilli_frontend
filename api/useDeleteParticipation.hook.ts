import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteParticipation(id: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/participations/${id}`, {
    withCredentials: true,
  });
}

export default function useDeleteParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
    },
  });
}
