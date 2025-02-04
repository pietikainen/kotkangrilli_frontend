import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getStoreUrl(id: number | undefined) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/games/store-url/${id}`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetStoreUrl(id: number | undefined) {
  return useQuery({
    queryKey: ["storeUrl", id],
    queryFn: () => getStoreUrl(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}
