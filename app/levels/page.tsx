"use client";

import { fetchLeaderboard } from "@/api/integration";
import { GamemodeFilter, LeaderboardLevel, RateFilter } from "@/api/models";
import { title } from "@/components/primitives";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import LevelRow from "@/components/level/levelRow";
import LevelPreview from "@/components/level/levelPreview";
import { SearchIcon } from "@/components/icons";

const PAGE_SIZE = 50;

type DropdownFilter<T> = "All" | T;

const RATE_OPTIONS: DropdownFilter<RateFilter>[] = ["All", "Rated", "Unrated"];
const GAMEMODE_OPTIONS: DropdownFilter<GamemodeFilter>[] = ["All", "Classic", "Platformer"];

function convertToServerFilter<T>(filter: DropdownFilter<T>): T | null {
  return filter === "All" ? null : (filter as T);
}

export default function LevelsPage() {
  const [levels, setLevels] = useState<LeaderboardLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LeaderboardLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rate, setRate] = useState<DropdownFilter<RateFilter>>("All");
  const [gamemode, setGamemode] = useState<DropdownFilter<GamemodeFilter>>("All");

  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLevels([]);
    setOffset(0);
    setHasMore(true);
    setSelectedLevel(null);
    loadLevels(0, true);
  }, [rate, gamemode, debouncedSearch]);

  const loadLevels = useCallback(
    async (currentOffset: number, initial = false) => {
      if (initial) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await fetchLeaderboard({
        offset: currentOffset,
        limit: PAGE_SIZE,
        rate_filter: convertToServerFilter(rate),
        gamemode_filter: convertToServerFilter(gamemode),
      });

      if (response.success && response.data) {
        setTotal(response.data?.total || 0);
        setLevels((prev) => (initial ? response.data?.levels || [] : [...prev, ...response.data?.levels || []]));
        setOffset(currentOffset + (response.data?.levels.length || 0));
        setHasMore((response.data?.levels.length || 0) === PAGE_SIZE && currentOffset + (response.data?.levels.length || 0) < (response.data?.total || 0));
      }
      setIsLoading(false);
      setIsFetchingMore(false);
    },
    [rate, gamemode, debouncedSearch]
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          loadLevels(offset);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetchingMore, isLoading, offset, loadLevels]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="width-full flex-shrink-0 px-6 pt-2 pb-4 border-b border-divider">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <h1 className={title({ size: "sm" })}>Levels</h1>
          {total > 0 && (
            <span className="text-sm text-default-400">{total.toLocaleString()} levels</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-divider">
          <div className="flex-shrink-0 p-3 border-b border-divider space-y-3 bg-default-50/30">
            <Input
              size="sm"
              placeholder="Search levels..."
              value={search}
              onValueChange={setSearch}
              startContent={
                <SearchIcon size={16} className="w-3.5 h-3.5 text-default-400" />
              }
              classNames={{ inputWrapper: "h-8" }}
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-default-400 mb-1.5">Rate</p>
              <div className="flex flex-wrap gap-1">
                {RATE_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setRate(d)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium capitalize
                      ${rate === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-divider text-default-500 hover:border-default-400 hover:text-default-700"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-default-400 mb-1.5">Gamemode</p>
              <div className="flex flex-wrap gap-1">
                {GAMEMODE_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setGamemode(d)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium capitalize
                      ${gamemode === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-divider text-default-500 hover:border-default-400 hover:text-default-700"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size="sm" />
              </div>
            ) : levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-default-400 text-sm gap-2 select-none">
                <SearchIcon className="w-8 h-8 opacity-40" />
                No levels found
              </div>
            ) : (
              <>
                {levels.map((level, i) => (
                  <LevelRow
                    key={level.level_id}
                    level={level}
                    rank={i + 1}
                    isSelected={selectedLevel?.level_id === level.level_id}
                    onClick={() => setSelectedLevel(level)}
                  />
                ))}

                <div ref={sentinelRef} className="h-4" />

                {isFetchingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                )}

                {!hasMore && levels.length > 0 && (
                  <p className="text-center text-xs text-default-300 py-4">
                    All {levels.length} levels loaded
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <LevelPreview level={selectedLevel} />
        </div>
      </div>
    </div>
  );
}