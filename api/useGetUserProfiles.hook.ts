import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function getUserProfiles() {
  return axios.get('http://localhost:5000/api/users/user-profiles', {
    withCredentials: true,
  });
}

export default function useGetUserProfiles() {
  return useQuery({
    queryKey: ['userProfiles'],
    queryFn: getUserProfiles,
  });
}
