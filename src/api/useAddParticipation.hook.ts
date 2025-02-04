import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postParticipation(eventId: number, arrivalDate: string) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/participations/${eventId}`,
    {
      arrivalDate,
    },
    {
      withCredentials: true,
    },
  );
}

export default function useAddParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      arrivalDate,
    }: {
      eventId: number;
      arrivalDate: string;
    }) => postParticipation(eventId, arrivalDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participations"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}
