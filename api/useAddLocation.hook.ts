import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postLocation(location: any) {
  return axios.post('http://localhost:5000/api/locations', location, {
    withCredentials: true,
  });
}

export default function useAddLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: any) => postLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
