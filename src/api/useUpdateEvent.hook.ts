import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import eventSchema from "../schemas/eventSchema";

async function putEvent(eventId: number, event: z.infer<typeof eventSchema>) {
  return axios.put(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/events/${eventId}`,
    event,
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      event,
    }: {
      eventId: number;
      event: z.infer<typeof eventSchema>;
    }) => putEvent(eventId, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
