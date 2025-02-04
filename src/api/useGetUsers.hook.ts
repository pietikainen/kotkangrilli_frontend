import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getUsers() {
  return axios.get(`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/users`, {
    withCredentials: true,
  });
}

export default function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}
