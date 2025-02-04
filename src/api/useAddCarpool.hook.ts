import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function postCarpool(carpool: object) {
  return axios.post(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/carpools`,
    carpool,
    {
      withCredentials: true,
    },
  );
}

export default function useAddCarpool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpool: object) => postCarpool(carpool),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carpools"] });
      queryClient.invalidateQueries({ queryKey: ["ownCarpools"] });
    },
  });
}
