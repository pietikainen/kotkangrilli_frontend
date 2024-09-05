import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getGamesSearch(title: string) {
  return axios.get(`http://localhost:5000/api/games/search/${title}`, {
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
