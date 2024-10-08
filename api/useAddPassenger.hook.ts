import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postPassenger(carpoolId: number) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/passengers/${carpoolId}`,
    {},
    {
      withCredentials: true,
    }
  );
}

export default function useAddPassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: number) => postPassenger(carpoolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
    },
  });
}
