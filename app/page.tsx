"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEffect } from "react";

export default function Home() {
  const { user, error, isLoading } = useUser({ shouldRetryOnError: false });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !error && user) router.push("/dashboard");
  }, [isLoading, user]);

  if (isLoading)
    return (
      <div className="flex items-center">
        <LoadingSpinner className="w-10 h-10 mr-2" />{" "}
        <h2 className="text-lg">Ladataan...</h2>
      </div>
    );
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;

  if (!user || error?.status === 401)
    return (
      <>
        <h1 className="text-xl mb-4">Kotkan grilin lani hasutus</h1>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="http://localhost:5000/auth/discord"
        >
          Kirjaudu sisään
          <SiDiscord className="ml-2" />
        </Link>
      </>
    );
}
