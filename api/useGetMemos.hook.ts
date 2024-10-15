import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getMemos() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/memos`, { withCredentials: true });
}

export default function useGetMemos() {
  return useQuery({
    queryKey: ['memos'],
    queryFn: getMemos,
  });
}
