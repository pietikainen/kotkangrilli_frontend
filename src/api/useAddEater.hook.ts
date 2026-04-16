import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postEater(
  mealId: number,
  comment: string | null,
  eaterId?: number,
) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/meals/${mealId}`,
    { comment, eaterId },
    {
      withCredentials: true,
    },
  );
}

export default function useAddEater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mealId,
      comment,
      eaterId,
    }: {
      mealId: number;
      comment: string | null;
      eaterId?: number;
    }) => postEater(mealId, comment, eaterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
      queryClient.invalidateQueries({ queryKey: ["paymentRequests"] });
    },
  });
}
