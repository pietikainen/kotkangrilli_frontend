import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getUser() {
  return axios.get('http://localhost:5000/api/users/me', { withCredentials: true });
}

export default function useGetUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
