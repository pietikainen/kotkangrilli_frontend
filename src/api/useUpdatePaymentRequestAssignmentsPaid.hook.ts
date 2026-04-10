import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function patchAssignmentPaid(id: number, paidLevel: number) {
  return axios.patch(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/payment-requests/assignments/${id}/paid`,
    { paidLevel },
    {
      withCredentials: true,
    },
  );
}

export default function useUpdatePaymentRequestAssignmentsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      paidLevel,
    }: {
      ids: number[];
      paidLevel: number;
    }) => {
      await Promise.all(ids.map((id) => patchAssignmentPaid(id, paidLevel)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myPaymentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["ownedPaymentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
      queryClient.invalidateQueries({ queryKey: ["passengers"] });
    },
  });
}
