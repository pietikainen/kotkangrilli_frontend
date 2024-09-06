import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getEvents() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`, { withCredentials: true });
}

export default function useGetEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });
}
