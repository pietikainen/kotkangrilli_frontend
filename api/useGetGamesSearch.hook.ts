import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getGamesSearch(title: string) {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/games/search/${title}`, {
    withCredentials: true,
  });
}

export default function useGetGamesSearch(title: string) {
  return useQuery({
    queryKey: ['gamesSearch', title],
    queryFn: () => getGamesSearch(title),
    enabled: !!title,
    refetchOnWindowFocus: false,
  });
}
