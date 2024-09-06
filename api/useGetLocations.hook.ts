import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getLocations() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/locations`, {
    withCredentials: true,
  });
}

export default function useGetLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
  });
}