import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getEaters(mealId: number | undefined) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/${mealId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetEaters(mealId: number | undefined) {
  return useQuery({
    queryKey: ["eaters", mealId],
    queryFn: () => getEaters(mealId),
    enabled: !!mealId,
  });
}
