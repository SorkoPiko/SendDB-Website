import { LeaderboardLevel } from "@/api/models";
import DifficultyBadge from "./difficultyBadge";

export default function LevelRow({
    level,
    rank,
    isSelected,
    onClick
}: {
    level: LeaderboardLevel,
    rank: number,
    isSelected: boolean,
    onClick: () => void
}) {
return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-b border-divider/40 hover:bg-default-100/60 group
        ${isSelected ? "bg-default-100 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"}`}
    >
      <span className={`text-xs font-mono w-8 flex-shrink-0 text-right ${isSelected ? "text-primary" : "text-default-400"}`}>
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight ${isSelected ? "text-foreground" : "text-default-700"}`}>
          {level.level_id}
        </p>
        <p className="text-xs text-default-400 truncate">Placeholder Author</p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs font-semibold text-default-600">{level.send_count.toLocaleString()}</span>
        <DifficultyBadge difficulty={-1} />
      </div>
    </button>
  );
}