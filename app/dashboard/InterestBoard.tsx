"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Button from "@/components/shared/Button";

type InterestItem = {
  id: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";
  createdAt: string;
  message: string | null;
  conversationId?: number | null;
  profile: {
    id: string;
    name: string;
    city: string | null;
    profession: string | null;
    photoUrl: string | null;
  };
};

type Props = {
  received: InterestItem[];
  sent: InterestItem[];
};

const interestDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatInterestDate(dateString: string) {
  return interestDateFormatter.format(new Date(dateString));
}

function InterestCard({
  item,
  actions,
  statusLabel,
  emphasis = "default",
  onOpenProfile,
}: {
  item: InterestItem;
  actions?: React.ReactNode;
  statusLabel?: string;
  emphasis?: "default" | "incoming" | "matched";
  onOpenProfile?: () => void;
}) {
  const containerClass =
    emphasis === "matched"
        ? "border-emerald-200/80 bg-emerald-50/50 shadow-[0_14px_30px_rgba(16,185,129,0.08)] dark:border-emerald-400/20 dark:bg-emerald-500/10"
        : "border-white/40 bg-white/70 dark:border-white/10 dark:bg-white/5";

  const interactiveProps = onOpenProfile
    ? {
        role: "link" as const,
        tabIndex: 0,
        "aria-label": `View profile of ${item.profile.name}`,
        onClick: () => onOpenProfile(),
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenProfile();
          }
        },
      }
    : {};

  const actionWrapperProps = onOpenProfile
    ? {
        onClick: (event: React.MouseEvent) => event.stopPropagation(),
        onKeyDown: (event: React.KeyboardEvent) => event.stopPropagation(),
      }
    : {};

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 ${containerClass} ${
        onOpenProfile
          ? "cursor-pointer transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
          : ""
      }`}
      {...interactiveProps}
    >
      <img
        src={item.profile.photoUrl ?? "/profiles/p1.jpg"}
        alt={item.profile.name}
        className="face-focus h-10 w-10 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900 dark:text-white">
          {item.profile.name}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {[item.profile.city, item.profile.profession]
            .filter(Boolean)
            .join(" • ") || "Profile details available"}
          {item.message ? ` · "${item.message}"` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2" {...actionWrapperProps}>
        <span className="text-[11px] text-slate-400">
          {formatInterestDate(item.createdAt)}
        </span>
        {statusLabel ? (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-600 dark:bg-white/10 dark:text-white">
            {statusLabel}
          </span>
        ) : null}
        {actions}
      </div>
    </div>
  );
}

export default function InterestBoard({ received, sent }: Props) {
  const router = useRouter();
  const [receivedItems, setReceivedItems] = useState(received);
  const [sentItems, setSentItems] = useState(sent);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [showAllSent, setShowAllSent] = useState(false);
  const [showAllReceived, setShowAllReceived] = useState(false);
  const featuredReceived = receivedItems[0] ?? null;
  const remainingReceived = featuredReceived
    ? receivedItems.slice(1)
    : receivedItems;

  const updateInterest = async (
    interestId: number,
    action: "accept" | "decline" | "withdraw"
  ) => {
    setLoadingId(interestId);
    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to update interest.");
      }

      const targetReceived = receivedItems.find((item) => item.id === interestId);
      const targetSent = sentItems.find((item) => item.id === interestId);

      if (action === "accept" && targetReceived) {
        setReceivedItems((current) => current.filter((item) => item.id !== interestId));
      }

      if (action === "decline") {
        setReceivedItems((current) => current.filter((item) => item.id !== interestId));
      }

      if (action === "withdraw" && targetSent) {
        setSentItems((current) =>
          current.map((item) =>
            item.id === interestId ? { ...item, status: "WITHDRAWN" } : item
          )
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to update interest."
      );
    } finally {
      setLoadingId(null);
    }
  };

  const pendingSent = sentItems.filter((item) => item.status === "PENDING");

  return (
    <div className="space-y-6">
      {featuredReceived ? (
        <div className="self-start rounded-3xl border border-brand-200/80 bg-brand-50/80 p-4 shadow-[0_18px_36px_rgba(127,16,62,0.10)] dark:border-white/15 dark:bg-white/[0.08] sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-500">
            Priority Interest
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <p className="font-serif text-xl text-slate-900 dark:text-white sm:text-2xl">
                {featuredReceived.profile.name}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {[featuredReceived.profile.city, featuredReceived.profile.profession]
                  .filter(Boolean)
                  .join(" • ") || "Profile details available"}
              </p>
              <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This member has shown interest in your profile. Review their request
                and respond to keep the conversation moving.
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Received on {formatInterestDate(featuredReceived.createdAt)}
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  size="sm"
                  onClick={() => updateInterest(featuredReceived.id, "accept")}
                  className="w-full justify-center sm:w-auto"
                  disabled={loadingId === featuredReceived.id}
                >
                  {loadingId === featuredReceived.id ? "Saving..." : "Accept"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateInterest(featuredReceived.id, "decline")}
                  className="w-full justify-center sm:w-auto"
                  disabled={loadingId === featuredReceived.id}
                >
                  Decline
                </Button>
              </div>
            </div>
            <img
              src={featuredReceived.profile.photoUrl ?? "/profiles/p1.jpg"}
              alt={featuredReceived.profile.name}
              className="face-focus-top h-48 w-full rounded-3xl sm:h-52 lg:w-[280px] lg:flex-none"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card self-start rounded-3xl p-4 sm:p-6">
          <h3 className="font-serif text-xl text-slate-900 dark:text-white">
            Received
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {featuredReceived
              ? "Other people waiting for your response."
              : "People waiting for your response."}
          </p>
          <div className="mt-4 space-y-2">
            {remainingReceived.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {featuredReceived
                  ? "No other pending interests right now."
                  : "No pending interests yet."}
              </p>
            ) : (
              <>
                {(showAllReceived ? remainingReceived : remainingReceived.slice(0, 1)).map((item) => (
                  <InterestCard
                    key={item.id}
                    item={item}
                    onOpenProfile={() => router.push(`/profiles/${item.profile.id}`)}
                    actions={
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateInterest(item.id, "accept")}
                          className="w-full justify-center sm:w-auto"
                          disabled={loadingId === item.id}
                        >
                          {loadingId === item.id ? "Saving..." : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateInterest(item.id, "decline")}
                          className="w-full justify-center sm:w-auto"
                          disabled={loadingId === item.id}
                        >
                          Decline
                        </Button>
                      </>
                    }
                  />
                ))}
                {remainingReceived.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReceived((prev) => !prev)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-white/5"
                  >
                    {showAllReceived
                      ? "Show less"
                      : `Show ${remainingReceived.length - 1} more`}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        showAllReceived ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="glass-card self-start rounded-3xl p-4 sm:p-6">
          <h3 className="font-serif text-xl text-slate-900 dark:text-white">
            Sent
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interests you have already sent.
          </p>
          <div className="mt-4 space-y-2">
            {pendingSent.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No outgoing interests yet.
              </p>
            ) : (
              <>
                {(showAllSent ? pendingSent : pendingSent.slice(0, 1)).map((item) => (
                  <InterestCard
                    key={item.id}
                    item={item}
                    statusLabel="Pending"
                    onOpenProfile={() => router.push(`/profiles/${item.profile.id}`)}
                    actions={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateInterest(item.id, "withdraw")}
                        className="w-full justify-center sm:w-auto"
                        disabled={loadingId === item.id}
                      >
                        {loadingId === item.id ? "Saving..." : "Withdraw"}
                      </Button>
                    }
                  />
                ))}
                {pendingSent.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSent((prev) => !prev)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-white/5"
                  >
                    {showAllSent
                      ? "Show less"
                      : `Show ${pendingSent.length - 1} more`}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        showAllSent ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
