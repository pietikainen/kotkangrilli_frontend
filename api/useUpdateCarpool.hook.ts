import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putCarpool(carpoolId: number, carpool: object) {
  return axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/carpools/${carpoolId}`, carpool, {
    withCredentials: true,
  });
}

export default function useUpdateCarpool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ carpoolId, carpool }: { carpoolId: number; carpool: object }) =>
      putCarpool(carpoolId, carpool),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carpools'] });
      queryClient.invalidateQueries({ queryKey: ['ownCarpools'] });
    },
  });
}
