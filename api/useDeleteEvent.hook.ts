import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteEvent(eventId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}`, {
    withCredentials: true,
  });
}

export default function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
