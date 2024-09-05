import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getStoreUrl(id: number) {
  return axios.get(`http://localhost:5000/api/games/store-url/${id}`, {
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
