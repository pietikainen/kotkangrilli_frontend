import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getOwnCarpools() {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/carpools/driver/me`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetOwnCarpools() {
  return useQuery({
    queryKey: ["ownCarpools"],
    queryFn: getOwnCarpools,
  });
}
