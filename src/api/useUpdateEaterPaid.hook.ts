import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function patchEaterPaid(id: number, paidLevel: number) {
  return axios.patch(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/set-paid/${id}`,
    { paidLevel },
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateEaterPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paidLevel }: { id: number; paidLevel: number }) =>
      patchEaterPaid(id, paidLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
    },
  });
}
