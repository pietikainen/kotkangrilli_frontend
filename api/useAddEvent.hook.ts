import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postEvent(event: any) {
  return axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/api/events`, event, {
    withCredentials: true,
  });
}

export default function useAddEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: any) => postEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
