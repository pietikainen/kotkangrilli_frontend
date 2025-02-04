import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import eventSchema from "../schemas/eventSchema";

async function postEvent(event: z.infer<typeof eventSchema>) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/events`,
    event,
    {
      withCredentials: true,
    },
  );
}

export default function useAddEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: z.infer<typeof eventSchema>) => postEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
