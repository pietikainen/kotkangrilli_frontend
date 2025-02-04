import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import activitySchema from "../schemas/activitySchema";

async function postActivity(
  eventId: number,
  activity: z.infer<typeof activitySchema>,
) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/activities/events/${eventId}`,
    activity,
    {
      withCredentials: true,
    },
  );
}

export default function useAddActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      activity,
    }: {
      eventId: number;
      activity: z.infer<typeof activitySchema>;
    }) => postActivity(eventId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
