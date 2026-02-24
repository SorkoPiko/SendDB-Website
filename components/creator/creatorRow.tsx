import { LeaderboardCreator } from "@/api/models";
import { Divider } from "@heroui/divider";

export default function CreatorRow({
    creator,
    rank,
    isSelected,
    onClick
}: {
    creator: LeaderboardCreator,
    rank: number,
    isSelected: boolean,
    onClick: () => void
}) {
return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-stretch gap-3 transition-all border-b border-divider/40 hover:bg-default-100/60 group
        ${isSelected ? "bg-default-100 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"}`}
    >
      <span className={`text-xs font-mono w-5 flex-shrink-0 text-right flex items-center justify-end ${isSelected ? "text-primary" : "text-default-400"}`}>
        {rank}
      </span>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className={`text-m font-semibold truncate leading-tight ${isSelected ? "text-foreground" : "text-default-700"}`}>
          {creator.name}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex flex-col items-center gap-0.5 w-3">
          <span className="text-xs font-semibold text-default-600">{creator.send_count.toLocaleString()}</span>
          <Divider />
          <span className="text-xs font-semibold text-default-500">{creator.level_count.toLocaleString()}</span>
        </div>
      </div>
    </button>
  );
}