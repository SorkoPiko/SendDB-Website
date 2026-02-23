import { LeaderboardLevel } from "@/api/models";
import DifficultyBadge from "./difficultyBadge";
import { SelectIcon } from "../icons";

export default function LeaderboardLevelPreview({ level }: { level: LeaderboardLevel | null }) {
  if (!level) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-default-400 text-sm gap-4 select-none">
        <SelectIcon size={64} className="w-16 h-16 opacity-40" />
        Select a level to preview
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 animate-in fade-in duration-200">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{level.level_id}</h2>
            <p className="text-default-500 mt-1">by <span className="text-default-600 font-medium">Placeholder Author</span></p>
          </div>
          <DifficultyBadge difficulty={-1} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Sends", value: level.send_count.toLocaleString() },
          { label: "LeaderboardLevel ID", value: `#${level.level_id}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-divider bg-default-50/50 p-4">
            <p className="text-xs text-default-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-lg font-semibold text-default-800`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-divider bg-default-50/30 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-default-400 mb-4">Send History</p>
        <div className="h-40 flex items-center justify-center text-default-300 text-sm">
          Chart placeholder
        </div>
      </div>
    </div>
  );
}