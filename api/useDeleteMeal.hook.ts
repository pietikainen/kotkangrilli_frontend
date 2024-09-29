import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteMeal(mealId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/${mealId}`, {
    withCredentials: true,
  });
}

export default function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: number) => deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
}
