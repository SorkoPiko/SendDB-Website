import { LeaderboardLevel, Level } from "@/api/models";
import RateBadge from "./rateBadge";
import { SelectIcon } from "../icons";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import GamemodeBadge from "./gamemodeBadge";

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
  lbLevel,
  isLoadingDetail,
}: {
  level: Level | null;
  lbLevel: LeaderboardLevel | null;
  isLoadingDetail?: boolean;
}) {
  if (isLoadingDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-3 select-none">
        <Spinner size="md" />
        <span className="text-xs uppercase tracking-widest">Loading level…</span>
      </div>
    );
  }

  if (!level || !lbLevel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-4 select-none">
        <SelectIcon size={48} className="opacity-30" />
        <span className="text-xs uppercase tracking-[0.25em]">Select a level to preview</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden w-full">
      <aside className="w-1/3 min-w-[220px] border-r border-divider flex flex-col overflow-y-auto max-w-sm">
        <div className="py-3 px-5 pb-4 flex items-stretch gap-3">
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
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
          {level.trending_score > 0.0 && (
            <StatRow label="Trending Score" value={level.trending_score.toFixed(2)} />
          )}
        </div>

        <Divider />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        
      </main>
    </div>
  );
}