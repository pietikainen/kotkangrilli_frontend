import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getUserProfiles() {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/users/user-profiles`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetUserProfiles() {
  return useQuery({
    queryKey: ["userProfiles"],
    queryFn: getUserProfiles,
  });
}
