import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getCarpoolsByEventId(eventId: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/carpools?eventId=${eventId}`, {
    withCredentials: true,
  });
}

export default function useGetCarpoolsByEventId(eventId: number) {
  return useQuery({
    queryKey: ['carpools', eventId],
    queryFn: () => getCarpoolsByEventId(eventId),
  });
}
