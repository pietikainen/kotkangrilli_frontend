import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getUsers() {
  return axios.get('http://localhost:5000/api/users', { withCredentials: true });
}

export default function useGetUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}
