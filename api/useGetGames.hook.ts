import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getGames() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/games`, { withCredentials: true });
}

export default function useGetGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: getGames,
  });
}
