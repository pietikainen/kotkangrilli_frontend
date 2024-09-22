import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

async function putLocation(locationId: number, location: any) {
  return axios.put(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/locations/${locationId}`,
    location,
    {
      withCredentials: true,
    }
  );
}

export default function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, location }: { locationId: number; location: any }) =>
      putLocation(locationId, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
