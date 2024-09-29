import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putMeal(mealId: number, meal: any) {
  return axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/${mealId}`, meal, {
    withCredentials: true,
  });
}

export default function useUpdateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mealId, meal }: { mealId: number; meal: any }) => putMeal(mealId, meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
}
