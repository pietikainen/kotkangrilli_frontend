import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getVotes(eventId: number) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/votes/${eventId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetVotes(eventId: number) {
  return useQuery({
    queryKey: ["votes", eventId],
    queryFn: () => getVotes(eventId),
    enabled: !!eventId,
  });
}
