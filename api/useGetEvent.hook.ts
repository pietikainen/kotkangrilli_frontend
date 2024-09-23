import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getEvent(id: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${id}`, {
    withCredentials: true,
  });
}

export default function useGetEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });
}
