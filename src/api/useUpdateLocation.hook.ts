import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import locationSchema from "../schemas/locationSchema";

async function putLocation(
  locationId: number,
  location: z.infer<typeof locationSchema>,
) {
  return axios.put(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/locations/${locationId}`,
    location,
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      locationId,
      location,
    }: {
      locationId: number;
      location: z.infer<typeof locationSchema>;
    }) => putLocation(locationId, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
