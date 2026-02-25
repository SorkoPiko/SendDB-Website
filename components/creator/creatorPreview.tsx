import { Spinner } from "@heroui/spinner";
import { CheckIcon, ChevronLeftIcon, SelectIcon, ShareIcon, SquareShareIcon } from "../icons";
import { Creator, LeaderboardLevel, Level, BatchLevel } from "@/api/models";
import { useState, useEffect, useCallback } from "react";
import { Divider } from "@heroui/divider";
import StatRow from "../statRow";
import LevelRow from "@/components/level/levelRow";
import LevelPreview from "@/components/level/levelPreview";
import { fetchLevels, fetchLevel } from "@/api/integration";

export default function CreatorPreview({
    creator,
    rank,
    isLoadingDetail
}: {
    creator: Creator | null,
    rank: number,
    isLoadingDetail: boolean
}) {
  const [copied, setCopied] = useState(false);

  const [batchLevels, setBatchLevels] = useState<LeaderboardLevel[]>([]);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LeaderboardLevel | null>(null);
  const [levelDetail, setLevelDetail] = useState<Level | null>(null);
  const [isLoadingLevelDetail, setIsLoadingLevelDetail] = useState(false);

  useEffect(() => {
    setSelectedLevel(null);
    setLevelDetail(null);
    setBatchLevels([]);

    if (!creator || creator.levels.length === 0) return;

    setIsLoadingBatch(true);
    const BATCH_SIZE = 50;
    const allIds = creator.levels.map(l => l.level_id);
    const chunks: number[][] = [];
    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      chunks.push(allIds.slice(i, i + BATCH_SIZE));
    }
    Promise.all(chunks.map(ids => fetchLevels({ level_ids: ids }))).then(results => {
      const allBatchLevels = results.flatMap(res => (res.success && res.data) ? res.data.levels : []);
      const batchMap = new Map<number, BatchLevel>(
        allBatchLevels.map(bl => [bl.level_id, bl])
      );
      const merged: LeaderboardLevel[] = creator.levels
        .map(cl => {
          const bl = batchMap.get(cl.level_id);
          return {
            name: cl.name,
            level_id: cl.level_id,
            creator: { name: creator.name, player_id: creator.player_id },
            send_count: bl?.send_count ?? cl.send_count,
            rank: bl?.rank ?? 0,
            platformer: bl?.platformer ?? false,
            rate: bl?.rate ?? null,
          };
        })
        .sort((a, b) => b.send_count - a.send_count)
        .map((level, index) => ({ ...level, rank: index + 1 }));
      setBatchLevels(merged);
      setIsLoadingBatch(false);
    });
  }, [creator]);

  const handleSelectLevel = useCallback(async (level: LeaderboardLevel) => {
    setLevelDetail(null);
    if (selectedLevel?.level_id === level.level_id) {
      setSelectedLevel(null);
      return;
    }
    setSelectedLevel(level);
    setIsLoadingLevelDetail(true);
    const res = await fetchLevel(level.level_id);
    if (res.success && res.data) setLevelDetail(res.data);
    setIsLoadingLevelDetail(false);
  }, [selectedLevel]);
  
  const handleShare = () => {
    const url = `${window.location.origin}/creator#${creator?.player_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (isLoadingDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-3 select-none">
        <Spinner size="md" />
        <span className="text-xs uppercase tracking-widest">Loading creator…</span>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-4 select-none">
        <SelectIcon size={48} className="opacity-30" />
        <span className="text-xs uppercase tracking-[0.25em]">Select a creator to preview</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden w-full">
      <aside className={`border-r border-divider flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${selectedLevel ? "w-0 min-w-0 opacity-0" : "w-1/3 min-w-[220px] max-w-sm opacity-100"}`}>
        <div className="py-3 px-5 pb-4 flex items-stretch gap-3">
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xl text-primary">{`#${rank.toLocaleString()}`}</span>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight text-default-900">
                {creator.name}
              </h2>
            </div>
          </div>
        </div>

        <div className="py-1 px-4 flex items-center justify-between">
          <span className="text-[15px] font-bold select-none">Creator Info</span>
          <button
            onClick={handleShare}
            title="Copy link to creator"
            className="flex items-center justify-center w-5 h-5 rounded transition-colors duration-150 text-default-400 hover:text-default-700 hover:bg-default-100 active:bg-default-200"
          >
            {copied
              ? <CheckIcon size={18} className="text-success" />
              : <ShareIcon size={18} />}
          </button>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Player ID" value={`${creator.player_id}`} />
          <StatRow label="Account ID" value={`${creator.account_id}`} />
        </div>

        <div className="pt-6 py-1 px-4">
          <span className="text-[15px] font-bold select-none">Send Info</span>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Total Sends" value={creator.send_count.toLocaleString()} />
          <StatRow label="Trending Score" value={creator.trending_score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
          {creator.recent_sends > 0 && (
            <StatRow label="Recent Sends" value={creator.recent_sends.toLocaleString()} />
          )}
          <StatRow label="Latest Send" value={creator.latest_send ? new Date(creator.latest_send).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "N/A"} />
        </div>


        <div className="pt-6 py-1 px-4">
          <span className="text-[15px] font-bold select-none">Rankings</span>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Overall" value={`#${creator.rank.toLocaleString()}`} />
          {creator.trending_rank > 0 && (
            <StatRow label="Trending" value={`#${creator.trending_rank.toLocaleString()}`} />
          )}
        </div>

        <div className="pt-6 py-1 px-4">
          <span className="text-[15px] font-bold select-none">Level Info</span>
        </div>

        <Divider />

        <div className="flex flex-col">
          <StatRow label="Sent Levels" value={creator.levels.length.toLocaleString()} />
          {(() => {
            const topLevel = creator.levels.reduce((best, l) => l.send_count > best.send_count ? l : best, creator.levels[0]);
            if (!topLevel) return null;
            return (
              <div className="flex items-baseline justify-between px-3 py-0.5 group">
                <span className="text-[15px] uppercase tracking-[0.1em] text-default-400 font-medium transition-colors duration-200 group-hover:text-default-500 select-none">
                  Top Level
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold tabular-nums text-default-800 transition-colors duration-200 group-hover:text-default-900">
                    {`${topLevel.name} (${topLevel.send_count.toLocaleString()})`}
                  </span>
                  <a
                    href={`/level#${topLevel.level_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open level in new tab"
                    className="flex items-center justify-center w-5 h-5 rounded transition-colors duration-150 text-default-400 hover:text-default-700 hover:bg-default-100 active:bg-default-200"
                  >
                    <SquareShareIcon size={15} />
                  </a>
                </div>
              </div>
            );
          })()}
          <StatRow label="Trending Levels" value={creator.trending_level_count.toLocaleString()} />
          <StatRow label="Average Sends" value={(creator.send_count / creator.levels.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
          <StatRow label="Std Deviation" value={creator.send_count_stddev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
        </div>
      </aside>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 py-1 px-2 flex items-center gap-1">
            <button
              onClick={() => { setSelectedLevel(null); setLevelDetail(null); }}
              title="Back to creator info"
              className={`flex items-center justify-center w-5 h-5 rounded transition-all duration-300 ease-in-out text-default-400 hover:text-default-700 hover:bg-default-100 active:bg-default-200 ${selectedLevel ? "opacity-100 w-5" : "opacity-0 w-0 overflow-hidden"}`}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <span className="text-[15px] font-bold select-none">Levels</span>
          </div>
          <Divider />
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isLoadingBatch ? (
              <div className="flex items-center justify-center h-20">
                <Spinner size="sm" />
              </div>
            ) : batchLevels.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-default-400 text-xs select-none">
                No levels
              </div>
            ) : (
              batchLevels.map(level => (
                <LevelRow
                  key={level.level_id}
                  level={level}
                  rank={level.rank}
                  isSelected={selectedLevel?.level_id === level.level_id}
                  onClick={() => handleSelectLevel(level)}
                />
              ))
            )}
          </div>
        </div>

        <div
          className={`flex flex-col overflow-hidden border-l border-divider transition-all duration-300 ease-in-out w-full`}
        >
          <LevelPreview
            level={levelDetail}
            rank={selectedLevel?.rank ?? 0}
            isLoadingDetail={isLoadingLevelDetail}
          />
        </div>
      </main>
    </div>
  );
}