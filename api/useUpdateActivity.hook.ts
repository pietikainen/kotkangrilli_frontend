import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putActivity(activityId: number, activity: any) {
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/activities/${activityId}`,
    activity,
    {
      withCredentials: true,
    }
  );
}

export default function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, activity }: { activityId: number; activity: any }) =>
      putActivity(activityId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
