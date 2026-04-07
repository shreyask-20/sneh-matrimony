export function formatTimestamp(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())}/${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
}
