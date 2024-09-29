import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postMeal(meal: any) {
  return axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals`, meal, {
    withCredentials: true,
  });
}

export default function useAddMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meal) => postMeal(meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
}
