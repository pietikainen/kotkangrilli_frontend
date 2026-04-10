import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getMyPaymentRequests() {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/payment-requests/me`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetMyPaymentRequests() {
  return useQuery({
    queryKey: ["myPaymentRequests"],
    queryFn: getMyPaymentRequests,
  });
}
