"use client";
import { useUser } from "@/lib/api";
import { useRouter } from "next/navigation";

import React, { useEffect } from "react";
import Navbar from "@/components/navbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, error, isLoading } = useUser({});

  useEffect(() => {
    if (!isLoading && (!user || error?.status === 401)) router.push("/");
  }, [isLoading, error, user, router]);

  if (isLoading || !user)
    return (
      <div className="flex items-center">
        <LoadingSpinner />
        <span>Ladataan...</span>
      </div>
    );
  if (error && error.status !== 401) return <p>Virhe: {error.message}</p>;

  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
    </>
  );
}
