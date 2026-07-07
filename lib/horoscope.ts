export type HoroscopeChartHouseKey =
  | "house1"
  | "house2"
  | "house3"
  | "house4"
  | "house5"
  | "house6"
  | "house7"
  | "house8"
  | "house9"
  | "house10"
  | "house11"
  | "house12";

export type HoroscopeChart = Partial<Record<HoroscopeChartHouseKey, string>>;

export const horoscopeChartHouseKeys: HoroscopeChartHouseKey[] = [
  "house1",
  "house2",
  "house3",
  "house4",
  "house5",
  "house6",
  "house7",
  "house8",
  "house9",
  "house10",
  "house11",
  "house12",
];

export const emptyHoroscopeChart = horoscopeChartHouseKeys.reduce<HoroscopeChart>((chart, key) => {
  chart[key] = "";
  return chart;
}, {});

export function normalizeHoroscopeChartInput(value: unknown): HoroscopeChart | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const chart = { ...emptyHoroscopeChart };

  for (const key of horoscopeChartHouseKeys) {
    const cellValue = (value as Record<string, unknown>)[key];
    chart[key] = typeof cellValue === "string" ? cellValue.trim() : "";
  }

  const hasAnyValue = horoscopeChartHouseKeys.some((key) => chart[key]);
  return hasAnyValue ? chart : null;
}

