import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postEvent(event: any) {
  return axios.post('http://localhost:5000/api/events', event, {
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
