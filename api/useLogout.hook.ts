import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function postLogout() {
  return axios.post('http://localhost:5000/api/users/logout', {}, { withCredentials: true });
}

export default function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
