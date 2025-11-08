import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function patchEaterComment(id: number, comment: string | null) {
  return axios.patch(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/eaters/comment/${id}`,
    { comment },
    {
      withCredentials: true,
    },
  );
}

export default function useUpdateEaterComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string | null }) =>
      patchEaterComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eaters"] });
    },
  });
}
