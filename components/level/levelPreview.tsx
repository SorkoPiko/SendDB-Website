"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import GamemodeBadge from "./gamemodeBadge";
import RateBadge from "./rateBadge";
import { Level, Creator } from "@/api/models";
import { fetchCreator } from "@/api/integration";
import { SelectIcon } from "../icons";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useTheme } from "next-themes";
import { peakTrendingScore, trendingScore } from "@/api/trending";
import StatRow from "../statRow";
import { RiCheckLine, RiExternalLinkFill, RiLinkM } from "@remixicon/react";

const LENGTH_LABELS: Record<number, string> = {
  0: "Tiny",
  1: "Short",
  2: "Medium",
  3: "Long",
  4: "XL"
};

const RATE_LABELS: Record<number, string> = {
  1: "Star only",
  2: "Featured",
  3: "Epic",
  4: "Legendary",
  5: "Mythic"
};

export default function LevelPreview({
  level,
  rank,
  isLoadingDetail,
  creatorParent = false,
}: {
  level: Level | null;
  rank: number;
  isLoadingDetail?: boolean;
  creatorParent?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const muiTheme = useMemo(
    () => createTheme({
      palette: { mode: resolvedTheme === "dark" ? "dark" : "light" },
      typography: { fontFamily: "var(--font-graph), sans-serif" },
    }),
    [resolvedTheme]
  );

  const rafRef = useRef<number | null>(null);
  const [liveTrendingScore, setLiveTrendingScore] = useState<number>(
    level ? trendingScore(level.sends, Date.now()) : 0
  );
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoadingCreator, setIsLoadingCreator] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/level#${level?.level_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  useEffect(() => {
    if (level) {
      setEndTime(level.rate ? new Date(level.rate.timestamp) : new Date());
    }
  }, [level]);

  useEffect(() => {
    if (!level) {
      setCreator(null);
      return;
    }
    let cancelled = false;
    setIsLoadingCreator(true);
    fetchCreator(level.creator.player_id).then(res => {
      if (!cancelled) {
        setCreator(res.data || null);
        setIsLoadingCreator(false);
      }
    });
    return () => { cancelled = true; };
  }, [level]);

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

  if (!level || !endTime) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-4 select-none">
        <SelectIcon size={48} className="opacity-40" />
        <span className="text-xs uppercase tracking-[0.25em]">Select a level to preview</span>
      </div>
    );
  }

  const end = endTime;

  const dataset: { time: Date; send_count: number }[] = [];
  const sortedSends = [...level.sends].sort((a, b) => a.timestamp - b.timestamp);
  const startTime = sortedSends.length > 0 ? new Date(sortedSends[0].timestamp).getTime() : 0;

  const firstSend = sortedSends.length > 0 ? new Date(sortedSends[0].timestamp) : null;
  const lastSend = sortedSends.length > 0 ? new Date(sortedSends[sortedSends.length - 1].timestamp) : null;
  const refTime = level.rate ? new Date(level.rate.timestamp) : (lastSend ?? new Date());
  const daysSpan = firstSend ? (refTime.getTime() - firstSend.getTime()) / (1000 * 60 * 60 * 24) : 0;
  const sendsPerDay = daysSpan > 0 ? level.sends.length / daysSpan : null;

  const avgSendsPerLevel = creator && creator.levels.length > 0
    ? creator.send_count / creator.levels.length
    : null;
  const sendsDiff = avgSendsPerLevel !== null ? level.sends.length - avgSendsPerLevel : null;
  const sendsPct = avgSendsPerLevel && avgSendsPerLevel > 0
    ? ((level.sends.length - avgSendsPerLevel) / avgSendsPerLevel) * 100
    : null;
  const zScore = creator && creator.send_count_stddev > 0 && avgSendsPerLevel !== null
    ? (level.sends.length - avgSendsPerLevel) / creator.send_count_stddev
    : null;

  let cumulativeSends = 0;
  for (const send of sortedSends) {
    cumulativeSends += 1;
    dataset.push({ time: new Date(send.timestamp), send_count: cumulativeSends });
  }
  if (dataset.length > 0) {
    dataset.push({ time: end, send_count: cumulativeSends });
  }

  const FORMULA_SAMPLES = 300;
  const formulaPoints: { time: Date; value: number }[] = [];
  if (sortedSends.length > 0) {
    const span = end.getTime() - startTime;
    for (let i = 0; i <= FORMULA_SAMPLES; i++) {
      const t = new Date(startTime + (i / FORMULA_SAMPLES) * span);
      formulaPoints.push({ time: t, value: trendingScore(level.sends, t.getTime()) });
    }
    for (const send of sortedSends) {
      const t = new Date(send.timestamp);
      formulaPoints.push({ time: t, value: trendingScore(level.sends, t.getTime()) });
    }
    formulaPoints.sort((a, b) => a.time.getTime() - b.time.getTime());
  }
  const formulaTimes = formulaPoints.map(p => p.time);
  const formulaValues = formulaPoints.map(p => p.value);

  const peakScore = peakTrendingScore(level.sends);

  return (
    <div className="flex-1 flex overflow-hidden w-full">
      <aside className="w-1/3 min-w-[220px] border-r border-divider flex flex-col overflow-y-auto max-w-sm">
        <div className="py-3 px-5 pb-4 flex items-stretch gap-3">
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xl text-primary">{`#${rank.toLocaleString()}`}</span>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight text-default-900">
                {level.name}
              </h2>
              <GamemodeBadge platformer={level.platformer} size={20} />
            </div>
            <p className="text-xs text-default-400">
              by&nbsp;
              <span className="text-default-600 font-semibold inline-flex items-center gap-1">
                {level.creator.name}
                {!creatorParent && (
                  <a
                    href={`/creator#${level.creator.player_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open creator in new tab"
                    className="flex items-center justify-center w-5 h-5 rounded transition-colors duration-150 text-default-400 hover:text-default-700 hover:bg-default-100 active:bg-default-200"
                  >
                    <RiExternalLinkFill size={15} />
                  </a>
                )}
              </span>
            </p>
          </div>

          <div className="flex items-stretch gap-2 shrink-0">
            <RateBadge rate={level.rate} />
          </div>
        </div>

        <div className="py-1 px-4 flex items-center justify-between">
          <span className="text-[15px] font-bold select-none">Level Info</span>
          <button
            onClick={handleShare}
            title="Copy link to level"
            className="flex items-center justify-center w-5 h-5 rounded transition-colors duration-150 text-default-400 hover:text-default-700 hover:bg-default-100 active:bg-default-200"
          >
            {copied
              ? <RiCheckLine size={18} className="text-success" />
              : <RiLinkM size={18} />}
          </button>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Level ID" value={`${level.level_id}`} />
          {level.rate && (
            <StatRow label="Rated on" value={new Date(level.rate.timestamp).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })} />
          )}
          {!level.platformer && (
            <StatRow label="Length" value={LENGTH_LABELS[level.length]} />
          )}
          <StatRow label="Gamemode" value={level.platformer ? "Platformer" : "Classic"} />
          {level.rate && (
            <>
              <StatRow label={level.platformer ? "Moons" : "Stars"} value={`${level.rate.stars}${level.platformer ? "☾" : "★"}`} />
              <StatRow label="Rating" value={RATE_LABELS[level.rate.points]} />
            </>
          )}
        </div>

        <div className="pt-6 py-1 px-4">
          <span className="text-[15px] font-bold select-none">Send Info</span>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Total Sends" value={level.sends.length.toLocaleString()} />
          {!level.rate && (
            <StatRow label="Trending Score" value={liveTrendingScore.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
          )}
          <StatRow label="Trending Peak" value={peakScore.score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
          {sendsPerDay !== null && (
            <StatRow label="Sends / Day" value={sendsPerDay.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} />
          )}
          {firstSend && (
            <StatRow label="First Send" value={firstSend.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })} />
          )}
          {!level.accurate && (
            <StatRow label="Accuracy" value="Incomplete" />
          )}
        </div>

        <div className="pt-6 py-1 px-4">
          <span className="text-[15px] font-bold select-none">Rankings</span>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Overall" value={`#${level.rank.toLocaleString()}`} />
          {level.trending_rank > 0 && (
            <StatRow label="Trending" value={`#${level.trending_rank.toLocaleString()}`} />
          )}
          <StatRow label={level.rate ? "Rated" : "Unrated"} value={`#${level.rate_rank.toLocaleString()}`} />
          <StatRow label={level.platformer ? "Platformer" : "Classic"} value={`#${level.gamemode_rank.toLocaleString()}`} />
          <StatRow label={`${level.rate ? "Rated" : "Unrated"} ${level.platformer ? "Platformer" : "Classic"}`} value={`#${level.joined_rank.toLocaleString()}`} />
        </div>

        <div className="pt-6 py-1 px-4">
          <span className="text-[15px] font-bold select-none">Creator</span>
        </div>

        <Divider />

        {isLoadingCreator ? (
          <div className="flex items-center justify-center py-3">
            <Spinner size="sm" />
          </div>
        ) : creator ? (
          <div className="flex flex-col">
            <StatRow label="Creator Rank" value={`#${creator.rank.toLocaleString()}`} />
            <StatRow label="Trending Score" value={creator.trending_score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
            <StatRow label="Sent Levels" value={creator.levels.length.toLocaleString()} />
            {avgSendsPerLevel !== null && (
              <StatRow label="Avg Sends / Lvl" value={avgSendsPerLevel.toLocaleString(undefined, { maximumFractionDigits: 1 })} />
            )}
            {sendsDiff !== null && sendsPct !== null && (
              <StatRow
                label="vs Avg"
                value={`${sendsDiff >= 0 ? "+" : ""}${sendsDiff.toLocaleString(undefined, { maximumFractionDigits: 1 })} (${sendsPct >= 0 ? "+" : ""}${sendsPct.toFixed(1)}%)`}
              />
            )}
            {zScore !== null && (
              <StatRow label="Std Deviations" value={`${zScore >= 0 ? "+" : ""}${zScore.toFixed(2)}σ`} />
            )}
          </div>
        ) : null}
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
                  return (!level.rate || index !== sortedSends.length) && (level.rate !== null || index !== sortedSends.length);
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
              label={`${peakScore.score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • Peak Trending Score`}
              labelAlign="middle"
            />
          </LineChart>
        </ThemeProvider>
      </main>
    </div>
  );
}