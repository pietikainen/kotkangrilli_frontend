import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postEater(mealId: number, comment: string | null) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/meals/${mealId}`,
    { comment },
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
    }: {
      mealId: number;
      comment: string | null;
    }) => postEater(mealId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
    },
  });
}
