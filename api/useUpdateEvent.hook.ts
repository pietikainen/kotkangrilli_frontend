import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putEvent(eventId: number, event: any) {
  return axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}`, event, {
    withCredentials: true,
  });
}

export default function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, event }: { eventId: number; event: any }) => putEvent(eventId, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
