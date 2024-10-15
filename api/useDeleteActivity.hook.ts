import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteActivity(activityId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/activities/${activityId}`, {
    withCredentials: true,
  });
}

export default function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: number) => deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
