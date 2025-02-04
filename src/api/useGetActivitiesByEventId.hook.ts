import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getActivitiesByEventId(eventId: number | undefined) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/activities/events/${eventId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetActivitiesByEventId(eventId?: number) {
  return useQuery({
    queryKey: ["activities", eventId],
    queryFn: () => getActivitiesByEventId(eventId),
    enabled: !!eventId,
  });
}
