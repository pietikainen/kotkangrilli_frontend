import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getCarpools() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/carpools`, {
    withCredentials: true,
  });
}

export default function useGetCarpools() {
  return useQuery({
    queryKey: ['carpools'],
    queryFn: getCarpools,
  });
}
