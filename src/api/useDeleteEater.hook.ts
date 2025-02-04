import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function deleteEater(mealId: number, eaterId: number) {
  return axios.delete(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/${mealId}/${eaterId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useDeleteEater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mealId, eaterId }: { mealId: number; eaterId: number }) =>
      deleteEater(mealId, eaterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
    },
  });
}
