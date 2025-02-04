import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import mealSchema from "../schemas/mealSchema";

async function putMeal(mealId: number, meal: z.infer<typeof mealSchema>) {
  return axios.put(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/meals/${mealId}`,
    meal,
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mealId,
      meal,
    }: {
      mealId: number;
      meal: z.infer<typeof mealSchema>;
    }) => putMeal(mealId, meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}
