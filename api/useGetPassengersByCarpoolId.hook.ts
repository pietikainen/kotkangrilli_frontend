import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getPassengersByCarpoolId(carpoolId: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/passengers/${carpoolId}`, {
    withCredentials: true,
  });
}

export default function useGetPassengersByCarpoolId(carpoolId: number) {
  return useQuery({
    queryKey: ['passengers', carpoolId],
    queryFn: () => getPassengersByCarpoolId(carpoolId),
  });
}
