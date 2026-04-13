"use client";

import { type HoroscopeChart, horoscopeChartHouseKeys } from "@/lib/horoscope";

type HousePosition = {
  key: (typeof horoscopeChartHouseKeys)[number];
  label: string;
  x: string;
  y: string;
  align?: "left" | "center" | "right";
};

const housePositions: HousePosition[] = [
  { key: "house12", label: "H12", x: "14%", y: "25%" },
  { key: "house1", label: "H1", x: "33%", y: "11%" },
  { key: "house2", label: "H2", x: "67%", y: "11%", align: "right" },
  { key: "house11", label: "H11", x: "86%", y: "25%", align: "right" },
  { key: "house3", label: "H3", x: "26%", y: "41%" },
  { key: "house10", label: "H10", x: "74%", y: "41%", align: "right" },
  { key: "house4", label: "H4", x: "14%", y: "70%" },
  { key: "house9", label: "H9", x: "34%", y: "58%" },
  { key: "house8", label: "H8", x: "66%", y: "58%", align: "right" },
  { key: "house5", label: "H5", x: "86%", y: "70%", align: "right" },
  { key: "house6", label: "H6", x: "26%", y: "90%" },
  { key: "house7", label: "H7", x: "74%", y: "90%", align: "right" },
];

function textAlignClass(align: HousePosition["align"]) {
  if (align === "right") return "items-end text-right";
  if (align === "center") return "items-center text-center";
  return "items-start text-left";
}

export default function HoroscopeChart({
  chart,
}: {
  chart?: HoroscopeChart | null;
}) {
  const hasValues = chart
    ? horoscopeChartHouseKeys.some(
        (key) => (chart[key] ?? "").trim().length > 0
      )
    : false;

  return (
    <div className="rounded-[28px] border border-white/40 bg-white/85 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[520px]">
        
        {/* ✅ FIXED SVG */}
        <svg
          viewBox="0 0 100 75"
          className="h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {/* Outer box */}
          <rect
            x="2"
            y="2"
            width="96"
            height="71"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />

          {/* Main diagonals (X) */}
          <line
            x1="2"
            y1="2"
            x2="98"
            y2="73"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />
          <line
            x1="98"
            y1="2"
            x2="2"
            y2="73"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />

          {/* Diamond (correct kundli structure) */}
          <line
            x1="50"
            y1="2"
            x2="98"
            y2="37.5"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />
          <line
            x1="98"
            y1="37.5"
            x2="50"
            y2="73"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />
          <line
            x1="50"
            y1="73"
            x2="2"
            y2="37.5"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />
          <line
            x1="2"
            y1="37.5"
            x2="50"
            y2="2"
            stroke="currentColor"
            strokeWidth="0.45"
            className="text-slate-500/80 dark:text-slate-300/80"
          />
        </svg>

        {/* House labels */}
        {housePositions.map((house) => (
          <div
            key={house.key}
            className={`absolute flex min-w-[54px] -translate-x-1/2 -translate-y-1/2 flex-col gap-1 ${textAlignClass(
              house.align
            )}`}
            style={{ left: house.x, top: house.y }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {house.label}
            </span>
            <span className="max-w-[84px] text-xs font-medium leading-4 text-slate-700 dark:text-slate-100">
              {chart?.[house.key] || " "}
            </span>
          </div>
        ))}
      </div>

      {!hasValues && (
        <p className="mt-3 text-xs text-slate-400">
          Fill the house fields below to render the kundli.
        </p>
      )}
    </div>
  );
}