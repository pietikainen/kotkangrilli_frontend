import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteCarpool(carpoolId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/carpools/${carpoolId}`, {
    withCredentials: true,
  });
}

export default function useDeleteCarpool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: number) => deleteCarpool(carpoolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carpools'] });
      queryClient.invalidateQueries({ queryKey: ['ownCarpools'] });
    },
  });
}
