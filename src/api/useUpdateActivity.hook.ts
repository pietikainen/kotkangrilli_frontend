import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import activitySchema from "../schemas/activitySchema";

async function putActivity(
  activityId: number,
  activity: z.infer<typeof activitySchema>,
) {
  return axios.put(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/activities/${activityId}`,
    activity,
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      activity,
    }: {
      activityId: number;
      activity: z.infer<typeof activitySchema>;
    }) => putActivity(activityId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
