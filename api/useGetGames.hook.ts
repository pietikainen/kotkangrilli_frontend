import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getGames() {
  return axios.get('http://localhost:5000/api/games', { withCredentials: true });
}

export default function useGetGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: getGames,
  });
}
