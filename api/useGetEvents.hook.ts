import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getEvents() {
  return axios.get('http://localhost:5000/api/events', { withCredentials: true });
}

export default function useGetEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });
}
