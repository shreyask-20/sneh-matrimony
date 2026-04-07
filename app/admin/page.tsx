import AdminClient from "./AdminClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <AdminClient initialTab={resolvedSearchParams?.tab} />;
}
