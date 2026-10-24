import { queryOptions, useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getLocations() {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/locations`,
    {
      withCredentials: true,
    },
  );
}

export const locationsQueryOptions = queryOptions({
  queryKey: ["locations"],
  queryFn: getLocations,
  staleTime: 10_000,
});

export default function useGetLocations() {
  return useQuery(locationsQueryOptions);
}
