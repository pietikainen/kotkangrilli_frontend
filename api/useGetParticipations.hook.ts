import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getParticipations(eventId: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/participations/${eventId}`, {
    withCredentials: true,
  });
}

export default function useGetParticipations(eventId: number) {
  return useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => getParticipations(eventId),
    enabled: !!eventId,
  });
}
