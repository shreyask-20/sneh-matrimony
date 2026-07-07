"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Button from "@/components/shared/Button";

export default function ReviveButton({
  scheduledDate,
}: {
  scheduledDate: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevive = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/cancel-deletion", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to revive account.");
        return;
      }
      signOut({ callbackUrl: "/auth/login" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="secondary"
          onClick={handleRevive}
          disabled={loading}
          className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800/30 dark:bg-green-900/10 dark:text-green-300"
        >
          {loading ? "Reviving..." : "Revive My Account"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          Sign Out
        </Button>
      </div>
    </>
  );
}
