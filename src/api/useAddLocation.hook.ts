import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import locationSchema from "../schemas/locationSchema";

async function postLocation(location: z.infer<typeof locationSchema>) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/locations`,
    location,
    {
      withCredentials: true,
    },
  );
}

export default function useAddLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: z.infer<typeof locationSchema>) =>
      postLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
