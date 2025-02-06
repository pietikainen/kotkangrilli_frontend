import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postCountVotesByEventId(eventId: number) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/votes/${eventId}/count`,
    {},
    { withCredentials: true },
  );
}

export default function usePostCountVotesByEventId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => postCountVotesByEventId(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game_votes"] });
    },
  });
}
