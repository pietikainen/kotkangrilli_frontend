import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deletePassenger(passengerId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/passengers/${passengerId}`, {
    withCredentials: true,
  });
}

export default function useDeletePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passengerId: number) => deletePassenger(passengerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
    },
  });
}
