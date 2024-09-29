import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getParticipations(userId: number | undefined) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/participations/user/${userId}`, {
    withCredentials: true,
  });
}

export default function useGetParticipationsByUserId(userId: number | undefined) {
  return useQuery({
    queryKey: ['participations', userId],
    queryFn: () => getParticipations(userId),
    enabled: !!userId,
  });
}
