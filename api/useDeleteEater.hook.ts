import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteEater(mealId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/eaters/${mealId}`, {
    withCredentials: true,
  });
}

export default function useDeleteEater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: number) => deleteEater(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eaters'] });
    },
  });
}
