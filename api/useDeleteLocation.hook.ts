import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function deleteLocation(locationId: number) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/locations/${locationId}`, {
    withCredentials: true,
  });
}

export default function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: number) => deleteLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
