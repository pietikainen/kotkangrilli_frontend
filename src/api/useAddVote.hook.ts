import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postVote({
  eventId,
  externalApiId,
}: {
  eventId: number;
  externalApiId: number;
}) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/votes/${eventId}`,
    { externalApiId },
    {
      withCredentials: true,
    },
  );
}

export default function useAddVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      externalApiId,
    }: {
      eventId: number;
      externalApiId: number;
    }) =>
      postVote({
        eventId,
        externalApiId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes"] });
    },
  });
}
