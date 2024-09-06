import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postLogout() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
    withCredentials: true,
  });
}

export default function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: () => {
      queryClient.clear();
    },
  });
}
