import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function patchParticipationPaid(id: number, paidLevel: number) {
  return axios.patch(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/participations/set-paid/${id}`,
    { paidLevel },
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateParticipationPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paidLevel }: { id: number; paidLevel: number }) =>
      patchParticipationPaid(id, paidLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participations"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}
