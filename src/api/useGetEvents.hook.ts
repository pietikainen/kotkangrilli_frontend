import { queryOptions, useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getEvents() {
  return axios.get(`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/events`, {
    withCredentials: true,
  });
}

export const eventsQueryOptions = queryOptions({
  queryKey: ["events"],
  queryFn: getEvents,
  staleTime: 10_000,
});

export default function useGetEvents() {
  return useQuery(eventsQueryOptions);
}
