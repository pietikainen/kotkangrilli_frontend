"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, error, isLoading } = useUser({ shouldRetryOnError: false });
  const router = useRouter();

  if (isLoading) return <p>Ladataan...</p>;
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;

  if (!user || error?.status === 401)
    return (
      <Link
        className={buttonVariants({ variant: "outline" })}
        href="http://localhost:5000/auth/discord"
      >
        Kirjaudu sisään
      </Link>
    );

  router.push("/dashboard");
}
