import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getPassengersByCarpoolId(carpoolId: number | undefined) {
  return axios.get(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/passengers/${carpoolId}`,
    {
      withCredentials: true,
    },
  );
}

export default function useGetPassengersByCarpoolId(
  carpoolId: number | undefined,
) {
  return useQuery({
    queryKey: ["passengers", carpoolId],
    queryFn: () => getPassengersByCarpoolId(carpoolId),
    enabled: !!carpoolId,
  });
}
