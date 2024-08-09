import useSWR from "swr";

export async function fetcher(path: string) {
  const res = await fetch(`http://localhost:5000/${path}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const data = await res.json();
    error.message = data.message || "Ei lisätietoja";
    (error as any).status = res.status;

    throw error;
  }

  return await res.json();
}

export function useUser({
  revalidateOnFocus = false,
  shouldRetryOnError = true,
}) {
  const { data, error, isLoading } = useSWR("api/users/me", fetcher, {
    revalidateOnFocus,
    shouldRetryOnError,
  });
  return { user: data, error, isLoading };
}
