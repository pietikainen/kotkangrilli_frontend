import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type CreatePaymentRequestPayload = {
  type: "event" | "meal" | "ride";
  eventId?: number;
  sourceId?: number;
  amount: number;
  comment?: string;
  userIds?: number[];
};

async function postPaymentRequest(payload: CreatePaymentRequestPayload) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/payment-requests`,
    payload,
    {
      withCredentials: true,
    },
  );
}

export default function useCreatePaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentRequestPayload) =>
      postPaymentRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
      queryClient.invalidateQueries({ queryKey: ["passengers"] });
    },
  });
}
