import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getUser() {
  return axios.get(`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/users/me`, {
    withCredentials: true,
  });
}

export default function useGetUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
