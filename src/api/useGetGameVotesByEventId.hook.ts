import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getGameVotesByEventId(eventId: number) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/votes/${eventId}/results`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetGameVotesByEventId(eventId: number) {
  return useQuery({
    queryKey: ["game_votes", eventId],
    queryFn: () => getGameVotesByEventId(eventId),
  });
}
