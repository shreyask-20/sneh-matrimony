"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";

type AdminUser = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  profession: string | null;
  education: string | null;
  city: string | null;
  bio: string | null;
  birthDate: string | null;
  maritalStatus: string | null;
  height: string | null;
  createdAt: string;
  isApproved: boolean;
  profileVisible: boolean;
  roleName: "ADMIN" | "USER";
  photos: Array<{
    id: number;
    url: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionRemarks: string | null;
  }>;
};

type ApprovalLog = {
  id: number;
  decision: "APPROVED" | "REJECTED" | "BLOCKED";
  remarks: string | null;
  actionDate: string;
  admin: { id: string; name: string | null; email: string | null };
  user: { id: string; name: string | null; email: string | null };
};

const tabs = [
  { id: "queue", label: "Approval Queue" },
  { id: "users", label: "All Users" },
  { id: "logs", label: "Approval Logs" },
];

export default function AdminClient({ initialTab }: { initialTab?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = useMemo(() => {
    const value = tabParam ?? initialTab ?? "queue";
    return tabs.find((t) => t.id === value) ? value : "queue";
  }, [tabParam, initialTab]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "pending" | "approved" | "visible" | "with-pending-photos"
  >("all");

  const fetchUsers = async (status: "pending" | "all") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?status=${status}`);
      if (!response.ok) throw new Error("Failed to load users");
      const data = (await response.json()) as { users: AdminUser[] };
      if (status === "all") {
        setAllUsers(data.users);
      } else {
        setUsers(data.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/logs");
      if (!response.ok) throw new Error("Failed to load logs");
      const data = (await response.json()) as { logs: ApprovalLog[] };
      setLogs(data.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("all");
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    setUserFilter(activeTab === "queue" ? "pending" : "all");
  }, [activeTab]);

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.push(`/admin?${params.toString()}`);
  };

  const updateUser = async (
    id: string,
    payload: Partial<{ decision: "APPROVED" | "REJECTED" | "BLOCKED"; remarks: string; profileVisible: boolean }>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");
      await fetchUsers("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (
    user: AdminUser,
    decision: "APPROVED" | "REJECTED" | "BLOCKED"
  ) => {
    if (decision === "APPROVED") {
      await updateUser(user.id, { decision });
      return;
    }

    const remarks = window.prompt(
      decision === "REJECTED"
        ? "Add a rejection reason for the member record:"
        : "Add a reason for blocking this profile:"
    );

    if (remarks === null) return;

    const trimmedRemarks = remarks.trim();
    if (!trimmedRemarks) {
      window.alert("A remark is required for this action.");
      return;
    }

    await updateUser(user.id, { decision, remarks: trimmedRemarks });
  };

  const updatePhoto = async (
    photoId: number,
    status: "APPROVED" | "REJECTED",
    remarks?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
      });
      if (!response.ok) throw new Error("Failed to update photo");
      await fetchUsers("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update photo");
    } finally {
      setLoading(false);
    }
  };

  const pendingUsers = allUsers.filter((user) => !user.isApproved);
  const approvedUsers = allUsers.filter((user) => user.isApproved);
  const visibleUsers = allUsers.filter((user) => user.profileVisible);
  const baseUsers = allUsers;
  const isLogsTab = activeTab === "logs";
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return baseUsers.filter((user) => {
      const pendingPhotoCount = user.photos.filter(
        (photo) => photo.status === "PENDING"
      ).length;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          user.name,
          user.firstName,
          user.lastName,
          user.email,
          user.phone,
          user.city,
          user.gender,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch));

      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "pending" && !user.isApproved) ||
        (userFilter === "approved" && user.isApproved) ||
        (userFilter === "visible" && user.profileVisible) ||
        (userFilter === "with-pending-photos" && pendingPhotoCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [baseUsers, normalizedSearch, userFilter]);

  const filteredLogs = useMemo(() => {
    if (!normalizedSearch) return logs;

    return logs.filter((log) =>
      [
        log.decision,
        log.remarks,
        log.user.name,
        log.user.email,
        log.admin.name,
        log.admin.email,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch))
    );
  }, [logs, normalizedSearch]);

  const pendingPhotoUsers = allUsers.filter((user) =>
    user.photos.some((photo) => photo.status === "PENDING")
  ).length;
  const rejectedPhotoUsers = allUsers.filter((user) =>
    user.photos.some((photo) => photo.status === "REJECTED")
  ).length;

  const isEmptyState =
    !loading &&
    ((!isLogsTab && filteredUsers.length === 0) ||
      (isLogsTab && filteredLogs.length === 0));

  return (
    <div className="min-h-screen bg-[#fbf6f8] pb-6 dark:bg-slate-950">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-3 py-4 sm:px-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-brand-100/60 bg-white p-5 text-sm text-slate-700 shadow-[0_14px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 lg:sticky lg:top-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-semibold text-white">
              SM
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                Admin
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                Dashboard
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`rounded-2xl px-3 py-2 text-left transition ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "hover:bg-brand-50/70 dark:hover:bg-white/10"
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-brand-100/60 bg-brand-50/60 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Only admins can access this space.
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-3rem)] flex-col gap-4">
          <div className="rounded-3xl border border-brand-100/60 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </p>
                <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
                  Welcome back, Admin
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push("/")}
                >
                  Open Site
                </Button>
                <div className="flex items-center gap-2 rounded-2xl border border-brand-100/60 bg-white px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                  <span>Search</span>
                  <input
                    className="w-32 bg-transparent text-sm outline-none sm:w-40"
                    placeholder="Name, email"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    fetchUsers("all");
                    if (activeTab === "logs") fetchLogs();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Users", value: allUsers.length },
              { label: "Pending Approvals", value: pendingUsers.length },
              { label: "Approved Users", value: approvedUsers.length },
              { label: "Visible Profiles", value: visibleUsers.length },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-3xl border border-brand-100/60 bg-white p-4 shadow-[0_10px_24px_rgba(127,16,62,0.06)] dark:border-white/10 dark:bg-slate-900/70"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-brand-50 dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-brand-600 dark:bg-white"
                    style={{ width: `${Math.min(100, card.value * 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex min-h-[420px] flex-1 flex-col rounded-3xl border border-brand-100/60 bg-white p-5 shadow-[0_12px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-slate-900 dark:text-white">
                {activeTab === "logs" ? "Approval Logs" : "User Approvals"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isLogsTab
                  ? `${filteredLogs.length} recent actions`
                  : `${filteredUsers.length} profile${filteredUsers.length === 1 ? "" : "s"} in this view`}
              </p>
            </div>

            {!isLogsTab ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All", count: baseUsers.length },
                  { id: "pending", label: "Pending", count: pendingUsers.length },
                  { id: "approved", label: "Approved", count: approvedUsers.length },
                  { id: "visible", label: "Visible", count: visibleUsers.length },
                  {
                    id: "with-pending-photos",
                    label: "Pending Photos",
                    count: pendingPhotoUsers,
                  },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() =>
                      setUserFilter(
                        filter.id as
                          | "all"
                          | "pending"
                          | "approved"
                          | "visible"
                          | "with-pending-photos"
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      userFilter === filter.id
                        ? "bg-brand-600 text-white"
                        : "border border-brand-100 bg-brand-50/60 text-slate-600 hover:bg-brand-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    }`}
                  >
                    {filter.label} · {filter.count}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{logs.length} total log entries</span>
                <span>{rejectedPhotoUsers} users with rejected photos</span>
              </div>
            )}

            {error ? (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            ) : null}

            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : null}

            {!loading && activeTab !== "logs" ? (
              <div className={`mt-6 ${isEmptyState ? "flex flex-1" : "space-y-4"}`}>
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-brand-100 bg-brand-50/40 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="max-w-md">
                      <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                        Approval Queue
                      </p>
                      <h3 className="mt-3 font-serif text-2xl text-slate-900 dark:text-white">
                        No users match this view
                      </h3>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Try clearing the search or changing the filter. New registrations
                        will appear here for review, approval, and photo moderation.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user.name ??
                                (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                                  "Unnamed")}
                            </p>
                            <Badge
                              label={user.isApproved ? "Approved" : "Pending"}
                              tone={user.isApproved ? "verified" : "neutral"}
                            />
                            {user.profileVisible ? (
                              <Badge label="Visible" tone="premium" />
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {user.email ?? "No email"} • {user.phone ?? "No phone"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.gender ?? "Gender not set"} •{" "}
                            {user.city ?? "City not set"}
                          </p>
                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl bg-brand-50/60 px-3 py-2 dark:bg-white/5">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-brand-400">
                                Profession
                              </p>
                              <p className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                                {user.profession ?? "Not shared"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-brand-50/60 px-3 py-2 dark:bg-white/5">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-brand-400">
                                Education
                              </p>
                              <p className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                                {user.education ?? "Not shared"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-brand-50/60 px-3 py-2 dark:bg-white/5">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-brand-400">
                                Marital Status
                              </p>
                              <p className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                                {user.maritalStatus ?? "Not shared"}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-brand-50/60 px-3 py-2 dark:bg-white/5">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-brand-400">
                                Height
                              </p>
                              <p className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                                {user.height ?? "Not shared"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                            {user.birthDate ? (
                              <span>
                                Born {new Date(user.birthDate).toLocaleDateString()}
                              </span>
                            ) : null}
                            <span>ID: {user.id.slice(0, 8)}</span>
                          </div>
                          <p className="mt-3 max-w-3xl rounded-2xl border border-brand-100/70 bg-brand-50/40 px-3 py-3 text-xs leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                            {user.bio?.trim()
                              ? user.bio
                              : "No bio submitted yet. The member should complete this before public visibility for a stronger profile."}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                            <span>
                              Photos: {user.photos.length}
                            </span>
                            <span>
                              Pending: {
                                user.photos.filter((photo) => photo.status === "PENDING").length
                              }
                            </span>
                            <span>
                              Rejected: {
                                user.photos.filter((photo) => photo.status === "REJECTED").length
                              }
                            </span>
                            <span>
                              Created {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-2 text-xs text-slate-500">
                            Visible
                            <input
                              type="checkbox"
                              checked={user.profileVisible}
                              disabled={!user.isApproved}
                              onChange={(event) =>
                                updateUser(user.id, {
                                  profileVisible: event.target.checked,
                                })
                              }
                            />
                          </label>
                          <Button
                            size="sm"
                            disabled={user.isApproved}
                            onClick={() => handleDecision(user, "APPROVED")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDecision(user, "REJECTED")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDecision(user, "BLOCKED")}
                          >
                            Block
                          </Button>
                        </div>
                      </div>
                      {user.photos.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {user.photos.map((photo) => (
                            <div
                              key={photo.id}
                              className="rounded-2xl border border-slate-200 bg-white p-2 text-xs text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-950"
                            >
                              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
                                <img
                                  src={photo.url}
                                  alt="Uploaded"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span>
                                  {photo.status === "APPROVED"
                                    ? "Approved"
                                    : photo.status === "REJECTED"
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                                    type="button"
                                    onClick={() => updatePhoto(photo.id, "APPROVED")}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                                    type="button"
                                    onClick={() => {
                                      const remarks = window.prompt(
                                        "Reason for rejection?"
                                      );
                                      updatePhoto(photo.id, "REJECTED", remarks ?? "");
                                    }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                              {photo.rejectionRemarks ? (
                                <p className="mt-2 text-xs text-slate-400">
                                  {photo.rejectionRemarks}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-slate-400">
                          No photos uploaded yet.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {!loading && activeTab === "logs" ? (
              <div className={`mt-6 ${isEmptyState ? "flex flex-1" : "space-y-4"}`}>
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-brand-100 bg-brand-50/40 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="max-w-md">
                      <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                        Approval Logs
                      </p>
                      <h3 className="mt-3 font-serif text-2xl text-slate-900 dark:text-white">
                        No approval activity yet
                      </h3>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Admin decisions will show up here once profiles are approved,
                        rejected, blocked, or reviewed.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {log.decision}
                      </p>
                      <p className="text-xs text-slate-500">
                        User: {log.user.name ?? log.user.email ?? log.user.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        Admin: {log.admin.name ?? log.admin.email ?? log.admin.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.actionDate).toLocaleString()}
                      </p>
                      {log.remarks ? (
                        <p className="mt-2 text-xs text-slate-500">
                          {log.remarks}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
