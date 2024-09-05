import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postLogout() {
  return axios.get('http://localhost:5000/auth/logout', { withCredentials: true });
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
