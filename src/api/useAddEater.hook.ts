import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postEater(mealId: number) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/meals/${mealId}`,
    {},
    {
      withCredentials: true,
    },
  );
}

export default function useAddEater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: number) => postEater(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
    },
  });
}
