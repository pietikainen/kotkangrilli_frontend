import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getEaters(mealId: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/eaters/${mealId}`, {
    withCredentials: true,
  });
}

export default function useGetEaters(mealId: number) {
  return useQuery({
    queryKey: ['eaters', mealId],
    queryFn: () => getEaters(mealId),
    enabled: !!mealId,
  });
}
