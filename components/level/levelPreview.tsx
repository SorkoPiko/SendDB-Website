"use client";

import { useState, useEffect, useRef } from "react";
import GamemodeBadge from "./gamemodeBadge";
import RateBadge from "./rateBadge";
import { Level } from "@/api/models";
import { SelectIcon } from "../icons";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useTheme } from "next-themes";
import { peakTrendingScore, trendingScore } from "@/api/trending";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between px-3 py-2 group">
      <span className="text-[15px] uppercase tracking-[0.2em] text-default-400 font-medium transition-colors duration-200 group-hover:text-default-500 select-none">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-default-800 transition-colors duration-200 group-hover:text-default-900">
        {value}
      </span>
    </div>
  );
}

export default function LeaderboardLevelPreview({
  level,
  rank,
  isLoadingDetail,
}: {
  level: Level | null;
  rank: number;
  isLoadingDetail?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const muiTheme = createTheme({ palette: { mode: resolvedTheme === "dark" ? "dark" : "light" } });

  const rafRef = useRef<number | null>(null);
  const [liveTrendingScore, setLiveTrendingScore] = useState<number>(
    level ? trendingScore(level.sends, Date.now()) : 0
  );

  useEffect(() => {
    if (!level || level.rate) {
      setLiveTrendingScore(0);
      return;
    }
    const loop = () => {
      setLiveTrendingScore(trendingScore(level.sends, Date.now()));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [level]);

  if (isLoadingDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-3 select-none">
        <Spinner size="md" />
        <span className="text-xs uppercase tracking-widest">Loading level…</span>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-4 select-none">
        <SelectIcon size={48} className="opacity-30" />
        <span className="text-xs uppercase tracking-[0.25em]">Select a level to preview</span>
      </div>
    );
  }

  let end = new Date();
  if (level.rate) {
    end = new Date(level.rate.timestamp);
  }

  const dataset: { time: Date; send_count: number }[] = [];
  const sortedSends = [...level.sends].sort((a, b) => a.timestamp - b.timestamp);
  const startTime = sortedSends.length > 0 ? new Date(sortedSends[0].timestamp).getTime() : 0;

  let cumulativeSends = 0;
  for (const send of sortedSends) {
    cumulativeSends += 1;
    const time = new Date(send.timestamp);
    dataset.push({ time, send_count: cumulativeSends });
  }

  if (dataset.length > 0) {
    dataset.push({ time: end, send_count: cumulativeSends });
  }

  const FORMULA_SAMPLES = 300;
  const formulaTimes: Date[] = [];
  const formulaValues: number[] = [];
  if (sortedSends.length > 0) {
    const span = end.getTime() - startTime;
    for (let i = 0; i <= FORMULA_SAMPLES; i++) {
      const t = new Date(startTime + (i / FORMULA_SAMPLES) * span);
      formulaTimes.push(t);
      formulaValues.push(trendingScore(level.sends, t.getTime()));
    }
  }

  const peakScore = peakTrendingScore(level.sends);

  return (
    <div className="flex-1 flex overflow-hidden w-full">
      <aside className="w-1/3 min-w-[220px] border-r border-divider flex flex-col overflow-y-auto max-w-sm">
        <div className="py-3 px-5 pb-4 flex items-stretch gap-3">
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-primary">{`#${rank.toLocaleString()}`}</span>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight text-default-900">
                {level.name}
              </h2>
              <GamemodeBadge platformer={level.platformer} size={20} />
            </div>
            <p className="text-xs text-default-400">
              by&nbsp;
              <span className="text-default-600 font-semibold">
                {level.creator.name}
              </span>
            </p>
          </div>

          <div className="flex items-stretch gap-2 shrink-0">
            <RateBadge rate={level.rate} />
          </div>
        </div>

        <Divider />

        <div className="flex flex-col divide-y divide-divider">
          <StatRow label="Level ID" value={`${level.level_id}`} />
          <StatRow label="Total Sends" value={level.sends.length.toLocaleString()} />
          <StatRow label="Rank" value={`#${level.rank.toLocaleString()}`} />
          {level.rate ? (
            <StatRow label="Rated on" value={new Date(level.rate.timestamp).toLocaleDateString(undefined, {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })} />
          ) : (
            <StatRow label="Trending Score" value={(liveTrendingScore > 0 ? liveTrendingScore.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A")} />
          )}
          <StatRow label="Trending Peak" value={peakScore.score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
        </div>

        <Divider />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <ThemeProvider theme={muiTheme}>
          <LineChart
            dataset={dataset}
            experimentalFeatures={{
              preferStrictDomainInLineCharts: true
            }}
            grid={{
              vertical: true,
              horizontal: true
            }}
            series={[
              {
                type: "line",
                id: "sends",
                dataKey: "send_count",
                label: "Sends",
                color: "var(--color-primary)",
                showMark: ({ index }) => {
                  return !level.rate || index !== sortedSends.length;
                },
                xAxisId: "time-axis",
                yAxisId: "send-axis",
                curve: "linear"
              },
              {
                type: "line",
                id: "trending",
                data: formulaValues,
                label: "Trending Score",
                color: "var(--color-trending)",
                showMark: false,
                xAxisId: "formula-x",
                yAxisId: "trending-axis",
                curve: "linear",
                area: true
              }
            ]}
            xAxis={[
              {
                id: "time-axis",
                scaleType: "time",
                dataKey: "time",
                tickNumber: 5,
                max: end,
                valueFormatter: (value, context) => {
                  if (context.location === 'tooltip') {
                    return value.toLocaleDateString(undefined, {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    });
                  } else {
                    return value.toLocaleDateString(undefined, {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    });
                  }
                },
                label: "Time",
              },
              {
                id: "formula-x",
                scaleType: "time",
                data: formulaTimes,
                max: end,
                tickNumber: 0,
                disableLine: true,
                disableTicks: true,
                tickLabelStyle: { display: "none" },
                valueFormatter: () => "",
              }
            ]}
            yAxis={[
              {
                id: "send-axis",
                scaleType: "linear",
                position: "left",
                label: "Sends",
              },
              {
                id: "trending-axis",
                scaleType: "linear",
                position: "right",
                label: "Trending Score",
                valueFormatter: (value: number) => {
                  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
                  return value.toFixed(2);
                },
              }
            ]}
            
            sx={{
              "& .MuiAreaElement-root[data-series=\"trending\"]": {
                fillOpacity: 0.15,
              }
            }}
          >
            <ChartsReferenceLine
              y={peakScore.score}
              axisId="trending-axis"
              lineStyle={{ strokeDasharray: '6 4', stroke: 'var(--color-trending)', opacity: 0.6 }}
              labelStyle={{ fontSize: '10', lineHeight: 1.2 }}
              label="Peak Trending Score"
              labelAlign="middle"
            />
          </LineChart>
        </ThemeProvider>
      </main>
    </div>
  );
}