import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getMemos() {
  return axios.get(`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/memos`, {
    withCredentials: true,
  });
}

export default function useGetMemos() {
  return useQuery({
    queryKey: ["memos"],
    queryFn: getMemos,
  });
}
