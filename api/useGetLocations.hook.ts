import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getLocations() {
  return axios.get('http://localhost:5000/api/locations', { withCredentials: true });
}

export default function useGetLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
  });
}
