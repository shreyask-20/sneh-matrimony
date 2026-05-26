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
  emailVerified: string | null;
  phone: string | null;
  gender: string | null;
  profession: string | null;
  education: string | null;
  city: string | null;
  religion: string | null;
  bio: string | null;
  birthDate: string | null;
  maritalStatus: string | null;
  height: string | null;
  createdAt: string;
  deletedAt: string | null;
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

const requiredProfileFields: Array<{
  key: keyof Pick<
    AdminUser,
    | "name"
    | "email"
    | "phone"
    | "gender"
    | "city"
    | "birthDate"
    | "profession"
    | "education"
    | "maritalStatus"
    | "height"
    | "bio"
  >;
  label: string;
}> = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "city", label: "City" },
  { key: "birthDate", label: "Date of birth" },
  { key: "profession", label: "Profession" },
  { key: "education", label: "Education" },
  { key: "maritalStatus", label: "Marital status" },
  { key: "height", label: "Height" },
  { key: "bio", label: "Bio" },
];

function getMissingRequiredFields(user: AdminUser) {
  return requiredProfileFields
    .filter((field) => {
      const value = user[field.key];
      return typeof value === "string" ? value.trim().length === 0 : !value;
    })
    .map((field) => field.label);
}

const tabs = [
  { id: "queue", label: "Approval Queue" },
  { id: "users", label: "All Users" },
  { id: "deleted", label: "Deleted" },
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
  const [genderFilter, setGenderFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [religionFilter, setReligionFilter] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "pending" | "approved" | "visible" | "with-pending-photos"
  >("all");
  const [userSort, setUserSort] = useState<
    "needs-action" | "newest" | "name" | "pending-photos"
  >("needs-action");

  const buildQueryString = (status: "pending" | "all" | "deleted") => {
    const params = new URLSearchParams({ status });
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (genderFilter) params.set("gender", genderFilter);
    if (cityFilter) params.set("city", cityFilter);
    if (religionFilter) params.set("religion", religionFilter);
    return params.toString();
  };

  const fetchUsers = async (status: "pending" | "all" | "deleted") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?${buildQueryString(status)}`);
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
    if (activeTab === "deleted") {
      fetchUsers("deleted");
    } else {
      fetchUsers("all");
    }
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab]);

  // Refetch when server-side filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "deleted") {
        fetchUsers("deleted");
      } else {
        fetchUsers("all");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, genderFilter, cityFilter, religionFilter]);

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
    payload: Partial<{
      decision: "APPROVED" | "REJECTED" | "BLOCKED";
      remarks: string;
      profileVisible: boolean;
      roleName: "ADMIN" | "USER";
    }>
  ) => {
    // Optimistic update — apply change immediately to local state
    const prevAllUsers = allUsers;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const next = { ...u };
        if (payload.profileVisible !== undefined) next.profileVisible = payload.profileVisible;
        if (payload.roleName) next.roleName = payload.roleName;
        if (payload.decision === "APPROVED") next.isApproved = true;
        if (payload.decision === "REJECTED" || payload.decision === "BLOCKED") next.isApproved = false;
        return next;
      })
    );
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to update user");
      }
    } catch (err) {
      // Revert on failure
      setAllUsers(prevAllUsers);
      setError(err instanceof Error ? err.message : "Failed to update user");
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

  const handleRoleChange = async (user: AdminUser, nextRole: "ADMIN" | "USER") => {
    if (user.roleName === nextRole) return;

    const confirmMessage =
      nextRole === "ADMIN"
        ? `Promote ${user.name ?? user.email ?? user.id} to admin?`
        : `Demote ${user.name ?? user.email ?? user.id} to user?`;

    if (!window.confirm(confirmMessage)) return;

    await updateUser(user.id, { roleName: nextRole });
  };

  const updatePhoto = async (
    photoId: number,
    status: "APPROVED" | "REJECTED",
    remarks?: string
  ) => {
    // Optimistic update — flip photo status immediately
    const prevAllUsers = allUsers;
    setAllUsers((prev) =>
      prev.map((u) => ({
        ...u,
        photos: u.photos.map((p) =>
          p.id === photoId
            ? { ...p, status, rejectionRemarks: remarks ?? p.rejectionRemarks }
            : p
        ),
      }))
    );
    setError(null);
    try {
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
      });
      if (!response.ok) throw new Error("Failed to update photo");
    } catch (err) {
      // Revert on failure
      setAllUsers(prevAllUsers);
      setError(err instanceof Error ? err.message : "Failed to update photo");
    }
  };

  const softDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Soft-delete ${user.name ?? user.email ?? user.id}? They will be hidden and cannot sign in, but data is preserved.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/delete`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to delete user");
      }
      // Remove from current list
      setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const restoreUser = async (user: AdminUser) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/delete`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to restore user");
      }
      // Refetch deleted list
      fetchUsers("deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore user");
    }
  };

  const memberUsers = allUsers.filter((user) => user.roleName === "USER");
  const adminUsers = allUsers.filter((user) => user.roleName === "ADMIN");
  const pendingUsers = memberUsers.filter((user) => !user.isApproved);
  const approvedUsers = memberUsers.filter((user) => user.isApproved);
  const visibleUsers = memberUsers.filter((user) => user.profileVisible);
  const baseUsers = activeTab === "queue" ? memberUsers : allUsers;
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

  const sortedUsers = useMemo(() => {
    const pendingPhotoCount = (user: AdminUser) =>
      user.photos.filter((photo) => photo.status === "PENDING").length;

    const needsActionScore = (user: AdminUser) => {
      const primaryStatus = user.photos[0]?.status;
      return (
        (!user.isApproved ? 80 : 0) +
        (primaryStatus === "PENDING" ? 50 : 0) +
        (!primaryStatus ? 35 : 0) +
        (primaryStatus === "REJECTED" ? 30 : 0) +
        pendingPhotoCount(user) * 12 +
        (!user.bio?.trim() ? 4 : 0)
      );
    };

    return [...filteredUsers].sort((a, b) => {
      if (userSort === "name") {
        const aName = a.name ?? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
        const bName = b.name ?? `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim();
        return aName.localeCompare(bName);
      }

      if (userSort === "pending-photos") {
        const photoDelta = pendingPhotoCount(b) - pendingPhotoCount(a);
        if (photoDelta !== 0) return photoDelta;
      }

      if (userSort === "needs-action") {
        const scoreDelta = needsActionScore(b) - needsActionScore(a);
        if (scoreDelta !== 0) return scoreDelta;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredUsers, userSort]);

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

  const pendingPhotoUsers = memberUsers.filter((user) =>
    user.photos.some((photo) => photo.status === "PENDING")
  ).length;
  const rejectedPhotoUsers = memberUsers.filter((user) =>
    user.photos.some((photo) => photo.status === "REJECTED")
  ).length;

  const isEmptyState =
    !loading &&
    ((!isLogsTab && filteredUsers.length === 0) ||
      (isLogsTab && filteredLogs.length === 0));

  return (
    <div className="min-h-screen bg-[#fbf6f8] pb-6 dark:bg-slate-950">
      <div className="grid w-full gap-4 px-2 py-3 sm:px-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 xl:px-8">
        <aside className="h-fit rounded-2xl border border-brand-100/60 bg-white p-4 text-sm text-slate-700 shadow-[0_14px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 sm:rounded-3xl sm:p-5 lg:sticky lg:top-4">
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
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:text-sm lg:flex lg:flex-col">
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

        <section className="flex min-h-0 flex-col gap-4 lg:min-h-[calc(100vh-3rem)]">
          <div className="rounded-2xl border border-brand-100/60 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70 sm:rounded-3xl sm:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </p>
                <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
                  Welcome back, Admin
                </h1>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center xl:w-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-center sm:w-auto"
                  onClick={() => router.push("/")}
                >
                  Open Site
                </Button>
                <div className="col-span-2 flex min-w-0 items-center gap-2 rounded-2xl border border-brand-100/60 bg-white px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 sm:col-span-1 sm:w-56">
                  <span>Search</span>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    placeholder="Name, email"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                {/* Server-side filter dropdowns */}
                {activeTab !== "logs" && (
                  <>
                    <select
                      className="w-full rounded-2xl border border-brand-100/60 bg-white px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 sm:w-auto"
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    >
                      <option value="">All genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <input
                      className="w-full rounded-2xl border border-brand-100/60 bg-white px-3 py-2 text-xs text-slate-600 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 sm:w-28"
                      placeholder="City"
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                    />
                    <input
                      className="w-full rounded-2xl border border-brand-100/60 bg-white px-3 py-2 text-xs text-slate-600 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 sm:w-28"
                      placeholder="Religion"
                      value={religionFilter}
                      onChange={(e) => setReligionFilter(e.target.value)}
                    />
                  </>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full justify-center sm:w-auto"
                  onClick={() => {
                    fetchUsers("all");
                    if (activeTab === "logs") fetchLogs();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  className="w-full justify-center sm:w-auto"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total users",
              value: allUsers.length,
              icon: "👥",
              iconBg: "bg-violet-50 dark:bg-violet-500/10",
              iconColor: "text-violet-600 dark:text-violet-400",
              barColor: "bg-violet-500",
            },
            {
              label: "Awaiting approval",
              value: pendingUsers.length,
              icon: "🕐",
              iconBg: "bg-amber-50 dark:bg-amber-500/10",
              iconColor: "text-amber-600 dark:text-amber-400",
              barColor: "bg-amber-400",
              badge: pendingUsers.length > 0 ? "Needs review" : null,
              badgeStyle: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
            },
            {
              label: "Approved members",
              value: approvedUsers.length,
              icon: "✓",
              iconBg: "bg-green-50 dark:bg-green-500/10",
              iconColor: "text-green-600 dark:text-green-400",
              barColor: "bg-green-500",
            },
            {
              label: "Visible profiles",
              value: visibleUsers.length,
              icon: "👁",
              iconBg: "bg-teal-50 dark:bg-teal-500/10",
              iconColor: "text-teal-600 dark:text-teal-400",
              barColor: "bg-teal-500",
            },
          ].map((card) => {
            const pct = allUsers.length > 0
              ? Math.min(10, Math.round((card.value / allUsers.length) * 100))
              : 0;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-brand-100/60 bg-white p-4 shadow-[0_10px_24px_rgba(127,16,62,0.06)] dark:border-white/10 dark:bg-slate-900/70"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${card.iconBg} ${card.iconColor} mb-3`}>
                  {card.icon}
                </div>
                <p className="text-[11px] uppercase tracking-[0.06em] text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <p className="mt-1 text-[26px] font-semibold leading-none text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <div className="my-3 h-[3px] w-full rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={`h-[3px] rounded-full transition-all duration-500 ${card.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{pct}% of total</span>
                  {"badge" in card && card.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${card.badgeStyle}`}>
                      {card.badge}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
          <div className="flex min-h-[420px] flex-1 flex-col rounded-2xl border border-brand-100/60 bg-white p-3 shadow-[0_12px_30px_rgba(127,16,62,0.08)] dark:border-white/10 dark:bg-slate-900/70 sm:rounded-3xl sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h2 className="font-serif text-xl text-slate-900 dark:text-white">
                {activeTab === "logs" ? "Approval Logs" : "User Approvals"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {isLogsTab
                  ? `${filteredLogs.length} recent actions`
                  : `${sortedUsers.length} profile${sortedUsers.length === 1 ? "" : "s"} in this view`}
              </p>
            </div>

            {!isLogsTab && activeTab !== "deleted" ? (
              <div className="mt-4 grid gap-3 lg:flex lg:flex-wrap lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
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
                <label className="flex w-full items-center justify-between gap-2 rounded-2xl border border-brand-100 bg-brand-50/50 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:w-auto">
                  Sort
                  <select
                    className="bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-100"
                    value={userSort}
                    onChange={(event) =>
                      setUserSort(
                        event.target.value as
                          | "needs-action"
                          | "newest"
                          | "name"
                          | "pending-photos"
                      )
                    }
                  >
                    <option value="needs-action">Needs action first</option>
                    <option value="pending-photos">Pending photos first</option>
                    <option value="newest">Newest first</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </label>
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

            {!loading && activeTab !== "logs" && activeTab !== "deleted" ? (
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
                  sortedUsers.map((user, index) => (
                    (() => {
                      const primaryPhoto = user.photos[0] ?? null;
                      const primaryPhotoApproved =
                        primaryPhoto?.status === "APPROVED";
                      const primaryPhotoPending =
                        primaryPhoto?.status === "PENDING";
                      const primaryPhotoRejected =
                        primaryPhoto?.status === "REJECTED";
                      const needsPrimaryPhotoApproval =
                        user.roleName === "USER" && !primaryPhotoApproved;
                      const approvalHelpText = !primaryPhoto
                        ? "Upload a primary photo before approving this member."
                        : primaryPhotoPending
                        ? "Approve the primary photo first, then approve the member."
                        : primaryPhotoRejected
                        ? "This member needs a new approved primary photo before profile approval."
                        : null;
                      const pendingPhotoCount = user.photos.filter(
                        (photo) => photo.status === "PENDING"
                      ).length;
                      const rejectedPhotoCount = user.photos.filter(
                        (photo) => photo.status === "REJECTED"
                      ).length;
                      const missingRequiredFields = getMissingRequiredFields(user);
                      const requiredProfileComplete =
                        missingRequiredFields.length === 0;
                      const emailVerified = Boolean(user.emailVerified);
                      const noRejectedPhotos = rejectedPhotoCount === 0;
                      const approvalChecklist = [
                        {
                          label: "Primary photo approved",
                          complete: primaryPhotoApproved,
                          detail: primaryPhoto
                            ? primaryPhoto.status.toLowerCase()
                            : "missing",
                        },
                        {
                          label: "Required profile fields complete",
                          complete: requiredProfileComplete,
                          detail: requiredProfileComplete
                            ? "complete"
                            : `Missing ${missingRequiredFields.length}`,
                        },
                        {
                          label: "Email verified",
                          complete: emailVerified,
                          detail: emailVerified ? "verified" : "not verified",
                        },
                        {
                          label: "No rejected photos",
                          complete: noRejectedPhotos,
                          detail: noRejectedPhotos
                            ? "clear"
                            : `${rejectedPhotoCount} rejected`,
                        },
                      ];
                      const profileReadyForApproval = approvalChecklist.every(
                        (item) => item.complete
                      );
                      const approvalButtonLabel = !primaryPhotoApproved
                        ? "Approve primary photo first"
                        : !requiredProfileComplete
                        ? "Complete required fields first"
                        : !emailVerified
                        ? "Verify email first"
                        : !noRejectedPhotos
                        ? "Resolve rejected photos first"
                        : "Approve member";

                      return (
                        <div
                          key={user.id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                        >
          <div className="grid gap-4 p-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-5">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                                  {index + 1}
                                </span>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {user.name ??
                                    (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                                      "Unnamed")}
                                </p>
                                <Badge
                                  label={user.isApproved ? "Approved" : "Pending"}
                                  tone={user.isApproved ? "verified" : "neutral"}
                                />
                                {user.roleName === "ADMIN" ? (
                                  <Badge label="Admin" tone="premium" />
                                ) : null}
                                {user.profileVisible ? (
                                  <Badge label="Visible" tone="premium" />
                                ) : null}
                              </div>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            {user.email ?? "No email"} • {user.phone ?? "No phone"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.gender ?? "Gender not set"} •{" "}
                            {user.city ?? "City not set"}
                          </p>
                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 2xl:grid-cols-4">
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
                          {!requiredProfileComplete ? (
                            <p className="mt-2 break-words text-xs text-amber-700 dark:text-amber-200">
                              Missing: {missingRequiredFields.join(", ")}
                            </p>
                          ) : null}
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
                              Primary:{" "}
                              {primaryPhoto
                                ? primaryPhoto.status === "APPROVED"
                                  ? "Approved"
                                  : primaryPhoto.status === "REJECTED"
                                  ? "Rejected"
                                  : "Pending"
                                : "Missing"}
                            </span>
                            <span>
                              Pending: {
                                pendingPhotoCount
                              }
                            </span>
                            <span>
                              Rejected: {
                                rejectedPhotoCount
                              }
                            </span>
                            <span>
                              Created {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              Email: {emailVerified ? "Verified" : "Not verified"}
                            </span>
                          </div>
                          {approvalHelpText ? (
                            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                              {approvalHelpText}
                            </p>
                          ) : null}
                          {user.photos.length > 0 ? (
                            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11px] font-semibold uppercase text-slate-400">
                                  Photo review
                                </p>
                                <p className="text-xs text-slate-400">
                                  {pendingPhotoCount} pending, {rejectedPhotoCount} rejected
                                </p>
                              </div>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                {user.photos.map((photo) => {
                                  const photoApproved = photo.status === "APPROVED";

                                  return (
                                    <div
                                      key={photo.id}
                                      className="rounded-2xl border border-slate-200 bg-white p-2 text-xs text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-950"
                                    >
                                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
                                        <img
                                          src={photo.url}
                                          alt="Uploaded"
                                          className="h-full w-full object-cover"
                                        />
                                        {photo.id === primaryPhoto?.id ? (
                                          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-950/85 dark:text-slate-100">
                                            Primary
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                        <span className="truncate">
                                          {photoApproved
                                            ? "Approved"
                                            : photo.status === "REJECTED"
                                            ? "Rejected"
                                            : "Pending"}
                                        </span>
                                        <div className="flex gap-1">
                                          <button
                                            className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 dark:disabled:hover:bg-transparent"
                                            type="button"
                                            disabled={photoApproved}
                                            onClick={() => updatePhoto(photo.id, "APPROVED")}
                                          >
                                            Approve
                                          </button>
                                          <button
                                            className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 dark:disabled:hover:bg-transparent"
                                            type="button"
                                            onClick={() => {
                                              const remarks = window.prompt(
                                                "Reason for rejection?"
                                              );
                                              if (remarks === null) return;
                                              updatePhoto(photo.id, "REJECTED", remarks.trim());
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
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-400 dark:border-white/10 dark:bg-white/[0.03]">
                              No photos uploaded yet.
                            </p>
                          )}
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
                          <p className="text-[11px] font-semibold uppercase text-slate-400">
                            Review actions
                          </p>
                          <div className="mt-4 grid gap-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950">
                              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                Approval checklist
                              </p>
                              <div className="grid gap-2.5">
                                {approvalChecklist.map((item) => (
                                  <div
                                    key={item.label}
                                    className="flex flex-col items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs dark:bg-white/[0.04] sm:flex-row sm:items-center sm:gap-3"
                                  >
                                    <span
                                      className={
                                        item.complete
                                          ? "min-w-0 font-medium leading-5 text-slate-700 dark:text-slate-200"
                                          : "min-w-0 font-medium leading-5 text-amber-700 dark:text-amber-200"
                                      }
                                    >
                                      {item.label}
                                    </span>
                                    <span
                                      className={
                                        item.complete
                                          ? "shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300"
                                          : "shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                                      }
                                    >
                                      {item.complete ? "Pass" : item.detail}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <label className="flex items-center justify-between gap-2 text-xs text-slate-500">
                              <span>Role</span>
                              <select
                                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                                value={user.roleName}
                                onChange={(event) =>
                                  handleRoleChange(
                                    user,
                                    event.target.value as "ADMIN" | "USER"
                                  )
                                }
                              >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </label>
                          {user.roleName === "USER" ? (
                            <>
                              <label className="flex items-center justify-between gap-2 text-xs text-slate-500">
                                <span>Visible profile</span>
                                <input
                                  type="checkbox"
                                  checked={user.profileVisible}
                                  disabled={!user.isApproved || !primaryPhotoApproved}
                                  title={
                                    !user.isApproved
                                      ? "Approve the member first"
                                      : !primaryPhotoApproved
                                        ? "Approve the primary photo first"
                                        : undefined
                                  }
                                  onChange={(event) =>
                                    updateUser(user.id, {
                                      profileVisible: event.target.checked,
                                    })
                                  }
                                />
                              </label>
                              <Button
                                size="sm"
                                className="w-full justify-center"
                                disabled={user.isApproved || !profileReadyForApproval}
                                onClick={() => handleDecision(user, "APPROVED")}
                              >
                                {approvalButtonLabel}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="w-full justify-center"
                                onClick={() => handleDecision(user, "REJECTED")}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-full justify-center"
                                onClick={() => handleDecision(user, "BLOCKED")}
                              >
                                Block
                              </Button>
                              <button
                                type="button"
                                onClick={() => softDeleteUser(user)}
                                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Admin accounts are not part of the approval queue.
                            </span>
                          )}
                          </div>
                        </div>
                      </div>
                        </div>
                      );
                    })()
                  ))
                )}
              </div>
            ) : null}

            {!loading && activeTab === "deleted" ? (
              <div className="mt-6 space-y-4">
                {users.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-brand-100 bg-brand-50/40 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="max-w-md">
                      <p className="text-xs uppercase tracking-[0.2em] text-brand-400">Deleted Accounts</p>
                      <h3 className="mt-3 font-serif text-2xl text-slate-900 dark:text-white">No deleted accounts</h3>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Soft-deleted accounts will appear here. Data is preserved and accounts can be restored.
                      </p>
                    </div>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-red-100 bg-red-50/40 px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/5 dark:text-slate-200">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user.name ?? (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unnamed")}
                            </p>
                            <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                              Deleted
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{user.email ?? "No email"} • {user.phone ?? "No phone"}</p>
                          <p className="text-xs text-slate-400">
                            Deleted: {user.deletedAt ? new Date(user.deletedAt).toLocaleString() : "Unknown"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => restoreUser(user)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          Restore account
                        </button>
                      </div>
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
