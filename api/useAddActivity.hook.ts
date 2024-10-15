import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postActivity(eventId: number, activity: any) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/activities/events/${eventId}`,
    activity,
    {
      withCredentials: true,
    }
  );
}

export default function useAddActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, activity }: { eventId: number; activity: any }) =>
      postActivity(eventId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
