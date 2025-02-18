import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function deleteEater(id: number) {
  return axios.delete(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/${id}`,
    {
      withCredentials: true,
    },
  );
}

export default function useDeleteEater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteEater(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
    },
  });
}
