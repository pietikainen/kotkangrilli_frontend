import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getPaymentRequestsByEventId(eventId: number | undefined) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/payment-requests/event/${eventId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetPaymentRequestsByEventId(
  eventId: number | undefined,
) {
  return useQuery({
    queryKey: ["paymentRequests", eventId],
    queryFn: () => getPaymentRequestsByEventId(eventId),
    enabled: !!eventId,
  });
}
