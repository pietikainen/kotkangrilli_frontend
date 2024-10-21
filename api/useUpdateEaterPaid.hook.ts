import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putEaterPaid(mealId: number, eaterId: number, paidLevel: number) {
  return axios.patch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/eaters/${mealId}/${eaterId}/${paidLevel}`,
    {},
    {
      withCredentials: true,
    }
  );
}

export default function useUpdateEaterPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mealId,
      eaterId,
      paidLevel,
    }: {
      mealId: number;
      eaterId: number;
      paidLevel: number;
    }) => putEaterPaid(mealId, eaterId, paidLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eaters'] });
    },
  });
}
