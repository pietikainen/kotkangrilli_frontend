import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getVotecount(eventId: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/votes/count/${eventId}`, {
    withCredentials: true,
  });
}

export default function useVotecount(eventId: number) {
  return useQuery({
    queryKey: ['votecount', eventId],
    queryFn: () => getVotecount(eventId),
    enabled: !!eventId,
  });
}
