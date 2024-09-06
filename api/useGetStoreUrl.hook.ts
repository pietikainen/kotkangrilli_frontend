import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getStoreUrl(id: number) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/games/store-url/${id}`, {
    withCredentials: true,
  });
}

export default function useGetStoreUrl(id: number) {
  return useQuery({
    queryKey: ['storeUrl', id],
    queryFn: () => getStoreUrl(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}
