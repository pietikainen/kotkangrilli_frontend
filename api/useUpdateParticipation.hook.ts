import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putParticipation(id: number, arrivalDate: string) {
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/participations/${id}`,
    {
      arrivalDate,
    },
    {
      withCredentials: true,
    }
  );
}

export default function useUpdateParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, arrivalDate }: { id: number; arrivalDate: string }) =>
      putParticipation(id, arrivalDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
    },
  });
}
