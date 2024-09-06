import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postLocation(location: any) {
  return axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/locations`, location, {
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
