import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getMeals(eventId: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/${eventId}`, {
    withCredentials: true,
  });
}

export default function useGetMeals(eventId: number) {
  return useQuery({
    queryKey: ['meals', eventId],
    queryFn: () => getMeals(eventId),
    enabled: !!eventId,
  });
}
