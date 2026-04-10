import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getOwnedPaymentRequests() {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/payment-requests/owned`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetOwnedPaymentRequests() {
  return useQuery({
    queryKey: ["ownedPaymentRequests"],
    queryFn: getOwnedPaymentRequests,
  });
}
