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

async function gameFetcher(path: string) {
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

  const data = await res.json();

  for (const game of data.data) {
    const res = await fetch(
      `http://localhost:5000/api/games/cover/${game.id}`,
      { credentials: "include" },
    );
    if (!res.ok) {
      if (res.status === 404) {
        game.coverImageUrl = null;
      } else {
        const error = new Error("An error occurred while fetching the data.");
        const data = await res.json();
        error.message = data.message || "Ei lisätietoja";
        (error as any).status = res.status;

        throw error;
      }
    } else {
      const cover = await res.json();
      game.coverImageUrl = cover.data;
    }
  }

  return data.data;
}

export function useGames() {
  const { data, error, isLoading } = useSWR("api/games", fetcher);
  return { games: data?.data, error, isLoading };
}

export function useUserProfiles() {
  const { data, error, isLoading } = useSWR("api/users/user-profiles", fetcher);
  return { userProfiles: data, error, isLoading };
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

export function useGamesSearch(title: string) {
  const { data, error, isLoading } = useSWR(
    title ? `api/games/search/${title}` : null,
    gameFetcher,
    {
      dedupingInterval: 60000,
    },
  );
  return { games: data, error, isLoading };
}

export function useUsers() {
  const { data, error, isLoading } = useSWR("api/users", fetcher);
  return { users: data, error, isLoading };
}

export function useEvents() {
  const { data, error, isLoading } = useSWR("api/events", fetcher);
  return { events: data?.data, error, isLoading };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR("api/locations", fetcher);
  return { locations: data?.data, error, isLoading };
}
