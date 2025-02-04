import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getVotecount(eventId: number | undefined) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/votes/count/${eventId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useVotecount(eventId: number | undefined) {
  return useQuery({
    queryKey: ["votecount", eventId],
    queryFn: () => getVotecount(eventId),
    enabled: !!eventId,
  });
}
