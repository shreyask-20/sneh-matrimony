"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import Button from "@/components/shared/Button";

type AdminUser = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  city: string | null;
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
    if (activeTab === "queue") {
      fetchUsers("pending");
    }
    if (activeTab === "users") {
      fetchUsers("all");
    }
    if (activeTab === "logs") {
      fetchLogs();
    }
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
      if (activeTab === "queue") {
        await fetchUsers("pending");
      }
      if (activeTab === "users") {
        await fetchUsers("all");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
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
      if (activeTab === "queue") {
        await fetchUsers("pending");
      } else if (activeTab === "users") {
        await fetchUsers("all");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update photo");
    } finally {
      setLoading(false);
    }
  };

  const pendingUsers = users;
  const approvedUsers = allUsers.filter((user) => user.isApproved);
  const visibleUsers = allUsers.filter((user) => user.profileVisible);

  return (
    <div className="min-h-screen bg-[#fbf6f8] pb-4 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-3 py-4 sm:px-4">
        <aside className="w-full max-w-[280px] rounded-3xl border border-brand-100/60 bg-white p-5 text-sm text-slate-700 shadow-[0_14px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
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

        <section className="flex-1 space-y-4">
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
              <div className="flex items-center gap-2">
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
                    className="w-40 bg-transparent text-sm outline-none"
                    placeholder="Name, email"
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    fetchUsers("all");
                    if (activeTab === "logs") fetchLogs();
                    if (activeTab === "queue") fetchUsers("pending");
                    if (activeTab === "users") fetchUsers("all");
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

          <div className="grid gap-4 lg:grid-cols-4">
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

          <div className="rounded-3xl border border-brand-100/60 bg-white p-5 shadow-[0_12px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-slate-900 dark:text-white">
                {activeTab === "logs" ? "Approval Logs" : "User Approvals"}
              </h2>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            ) : null}

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Loading...</p>
            ) : null}

            {!loading && activeTab !== "logs" ? (
              <div className="mt-6 space-y-4">
                {users.length === 0 ? (
                  <p className="text-sm text-slate-500">No users found.</p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.name ??
                              (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                                "Unnamed")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.email ?? "No email"} •{" "}
                            {user.phone ?? "No phone"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.gender ?? "Gender not set"} •{" "}
                            {user.city ?? "City not set"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-2 text-xs text-slate-500">
                            Visible
                            <input
                              type="checkbox"
                              checked={user.profileVisible}
                              onChange={(event) =>
                                updateUser(user.id, {
                                  profileVisible: event.target.checked,
                                })
                              }
                            />
                          </label>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateUser(user.id, { decision: "APPROVED" })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updateUser(user.id, { decision: "REJECTED" })
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateUser(user.id, { decision: "BLOCKED" })
                            }
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
                      <p className="mt-3 text-xs text-slate-400">
                        Created {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {!loading && activeTab === "logs" ? (
              <div className="mt-6 space-y-4">
                {logs.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No approval activity yet.
                  </p>
                ) : (
                  logs.map((log) => (
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
